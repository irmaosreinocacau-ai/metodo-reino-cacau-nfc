// Recebe os avisos da Hubla (carrinho abandonado, Pix gerado, pagamento etc.)
import type { Config } from "@netlify/functions"
import { getStore } from "@netlify/blobs"
import { brDate, classify, personFrom, personId, productFrom, utmFrom, payMethodFrom } from "../lib/recuperacao.mts"

export default async (req: Request) => {
  if (req.method !== "POST") return new Response("ok")
  const expected = Netlify.env.get("HUBLA_TOKEN")
  const got = req.headers.get("x-hubla-token")
  if (!expected || got !== expected) {
    const names = [...req.headers.keys()].join(",")
    const hits = [...req.headers.entries()].filter(([, v]) => expected && v.includes(expected)).map(([k]) => k)
    console.log(`401 webhook: env=${expected ? "len" + expected.length : "VAZIO"} header=${got ? "len" + got.length : "ausente"} headers=[${names}] tokenEm=[${hits.join(",")}]`)
    return new Response("unauthorized", { status: 401 })
  }

  let body: any
  try { body = await req.json() } catch { return new Response("bad json", { status: 400 }) }

  const store = getStore({ name: "recuperacao", consistency: "strong" })
  const now = Date.now()
  const kind = classify(body)
  const person = personFrom(body)
  const pid = personId(person)
  const type = String(body?.type ?? "")

  // guarda o aviso cru (últimos dias) para conferência
  await store.setJSON(`raw/${brDate(now)}/${now}-${Math.random().toString(36).slice(2, 8)}`, { type, kind, at: now, body })

  if (!pid) return new Response("ok (sem contato)")

  if (kind === "pago") {
    await store.setJSON(`pago/${pid}`, { at: now, type })
    if (person.email && person.phone) await store.setJSON(`pago/${personId({ phone: "", email: person.email })}`, { at: now, type })
    return new Response("ok")
  }

  if (kind === "carrinho" || kind === "pendente" || kind === "falhou") {
    const key = `lead/${brDate(now)}/${pid}`
    const prev: any = await store.get(key, { type: "json" })
    const rank: Record<string, number> = { carrinho: 1, pendente: 2, falhou: 3 }
    const keepKind = prev && rank[prev.kind] > rank[kind] ? prev.kind : kind
    await store.setJSON(key, {
      id: pid,
      kind: keepKind,
      name: person.name || prev?.name || "",
      phone: person.phone || prev?.phone || "",
      email: person.email || prev?.email || "",
      product: productFrom(body) || prev?.product || "",
      method: payMethodFrom(body) || prev?.method || "",
      utm: (() => { const u = utmFrom(body); return u.source || u.content ? u : (prev?.utm ?? u) })(),
      first: prev?.first ?? now,
      last: now,
      count: (prev?.count ?? 0) + 1,
      types: Array.from(new Set([...(prev?.types ?? []), type])).slice(-6),
    })
  }
  return new Response("ok")
}

export const config: Config = { path: "/api/hubla-webhook", method: ["POST", "GET"] }
