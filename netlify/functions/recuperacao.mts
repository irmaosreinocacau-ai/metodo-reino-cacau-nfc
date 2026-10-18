// Dados do painel de recuperação (protegido por senha)
import type { Config } from "@netlify/functions"
import { getStore } from "@netlify/blobs"
import { brDate } from "../lib/recuperacao.mts"

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  })
}

async function inChunks<T, R>(items: T[], size: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = []
  for (let i = 0; i < items.length; i += size) out.push(...(await Promise.all(items.slice(i, i + size).map(fn))))
  return out
}

export default async (req: Request) => {
  const senha = Netlify.env.get("PAINEL_SENHA")
  if (!senha || req.headers.get("x-senha") !== senha) return json({ erro: "senha" }, 401)

  const store = getStore({ name: "recuperacao", consistency: "strong" })
  const url = new URL(req.url)

  if (req.method === "POST") {
    const b: any = await req.json().catch(() => ({}))
    const id = String(b.id ?? "").replace(/[^a-z0-9@._+-]/gi, "")
    if (!id) return json({ erro: "id" }, 400)
    if (b.acao === "mandei") await store.setJSON(`mandei/${id}`, { at: Date.now(), vezes: (Number(b.vezes) || 0) + 1 })
    else if (b.acao === "desfazer") await store.delete(`mandei/${id}`)
    else if (b.acao === "ignorar") await store.setJSON(`ignorar/${id}`, { at: Date.now() })
    else if (b.acao === "voltar") await store.delete(`ignorar/${id}`)
    return json({ ok: true })
  }

  if (url.searchParams.get("debug") === "1") {
    const { blobs } = await store.list({ prefix: "raw/" })
    const last = blobs.map((b) => b.key).sort().slice(-15)
    const items = await inChunks(last, 15, (k) => store.get(k, { type: "json" }))
    return json({ eventos: items })
  }

  const dias = Math.min(Math.max(Number(url.searchParams.get("dias")) || 3, 1), 14)
  const prefixes: string[] = []
  for (let i = 0; i < dias; i++) prefixes.push(`lead/${brDate(Date.now() - i * 86400000)}/`)

  const keyLists = await Promise.all(prefixes.map((p) => store.list({ prefix: p })))
  const leadKeys = keyLists.flatMap((l) => l.blobs.map((b) => b.key))
  const [pagos, mandei, ignorar] = await Promise.all(
    ["pago/", "mandei/", "ignorar/"].map((p) => store.list({ prefix: p }).then((r) => r.blobs.map((b) => b.key.slice(p.length))))
  )
  const pagoSet = new Set(pagos), ignorarSet = new Set(ignorar)
  const mandeiData: Record<string, any> = {}
  await inChunks(mandei, 40, async (id) => { mandeiData[id] = await store.get(`mandei/${id}`, { type: "json" }) })

  const leads = (await inChunks(leadKeys, 40, (k) => store.get(k, { type: "json" }))).filter(Boolean) as any[]
  // mesma pessoa em dias diferentes: fica a mais recente
  const byId = new Map<string, any>()
  for (const l of leads) {
    const cur = byId.get(l.id)
    if (!cur || l.last > cur.last) byId.set(l.id, { ...l, count: (cur?.count ?? 0) + l.count })
  }
  const lista = [...byId.values()].map((l) => {
    const emailId = l.email ? "e" + String(l.email).replace(/[^a-z0-9@._-]/g, "") : ""
    return {
      ...l,
      pago: pagoSet.has(l.id) || (emailId && pagoSet.has(emailId)),
      mandei: mandeiData[l.id] ?? null,
      ignorado: ignorarSet.has(l.id),
    }
  }).sort((a, b) => b.last - a.last)

  return json({ agora: Date.now(), lista })
}

export const config: Config = { path: "/api/recuperacao", method: ["GET", "POST"] }
