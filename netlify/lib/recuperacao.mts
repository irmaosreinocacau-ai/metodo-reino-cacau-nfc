// Funções de apoio do painel de recuperação
export const BRT_OFFSET_MS = -3 * 60 * 60 * 1000

export function brDate(ts: number = Date.now()): string {
  return new Date(ts + BRT_OFFSET_MS).toISOString().slice(0, 10)
}

export function onlyDigits(v: unknown): string {
  return String(v ?? "").replace(/\D/g, "")
}

export function normPhone(v: unknown): string {
  let d = onlyDigits(v)
  if (!d) return ""
  if (d.length === 10 || d.length === 11) d = "55" + d
  return d
}

export function normEmail(v: unknown): string {
  return String(v ?? "").trim().toLowerCase()
}

// Procura a primeira chave com um destes nomes em qualquer lugar do objeto
export function deepFind(obj: any, names: string[], depth = 0): any {
  if (!obj || typeof obj !== "object" || depth > 6) return undefined
  for (const n of names) {
    if (obj[n] !== undefined && obj[n] !== null && obj[n] !== "") return obj[n]
  }
  for (const k of Object.keys(obj)) {
    const v = obj[k]
    if (v && typeof v === "object") {
      const r = deepFind(v, names, depth + 1)
      if (r !== undefined) return r
    }
  }
  return undefined
}

export function personFrom(event: any) {
  const ev = event?.event ?? event ?? {}
  // lugares mais prováveis primeiro
  const spots = [ev.lead, ev.payer, ev.invoice?.payer, ev.customer, ev.user, ev.subscription?.payer, ev]
  let phone = "", email = "", name = ""
  for (const s of spots) {
    if (!s || typeof s !== "object") continue
    phone ||= normPhone(deepFind(s, ["phone", "phoneNumber", "cellphone", "mobile"]))
    email ||= normEmail(deepFind(s, ["email"]))
    if (!name) {
      const full = deepFind(s, ["fullName", "full_name", "name"])
      const first = deepFind(s, ["firstName", "first_name"])
      const last = deepFind(s, ["lastName", "last_name"])
      if (typeof full === "string" && full.trim()) name = full.trim()
      else if (first) name = [first, last].filter(Boolean).join(" ").trim()
    }
  }
  return { phone, email, name }
}

export function productFrom(event: any): string {
  const ev = event?.event ?? event ?? {}
  const p = ev.products?.[0] ?? ev.product ?? ev.invoice?.product ?? ev.subscription?.product
  const n = p?.name ?? deepFind(ev, ["productName"])
  return typeof n === "string" ? n : ""
}

export function utmFrom(event: any) {
  const ev = event?.event ?? event ?? {}
  const u = deepFind(ev, ["utm", "utms"]) || {}
  return {
    source: String(u.source ?? u.utm_source ?? deepFind(ev, ["utm_source", "utmSource"]) ?? ""),
    medium: String(u.medium ?? u.utm_medium ?? deepFind(ev, ["utm_medium", "utmMedium"]) ?? ""),
    content: String(u.content ?? u.utm_content ?? deepFind(ev, ["utm_content", "utmContent"]) ?? ""),
    campaign: String(u.campaign ?? u.utm_campaign ?? deepFind(ev, ["utm_campaign", "utmCampaign"]) ?? ""),
  }
}

export function payMethodFrom(event: any): string {
  const m = deepFind(event?.event ?? event, ["paymentMethod", "payment_method", "method"])
  return typeof m === "string" ? m.toLowerCase() : ""
}

// Classifica o aviso da Hubla
// "carrinho" | "pendente" | "falhou" | "pago" | "outro"
export function classify(event: any): string {
  const t = String(event?.type ?? "").toLowerCase()
  const status = String(deepFind(event?.event ?? {}, ["status"]) ?? "").toLowerCase()
  if (t.includes("abandoned")) return "carrinho"
  if (t.includes("member_added") || t.includes("access_granted")) return "pago"
  if (/(paid|succeeded|approved|completed)/.test(t) || /^(paid|approved|succeeded|completed)$/.test(status)) return "pago"
  if (/(refund|chargeback)/.test(t)) return "outro"
  if (/(expired|refused|failed|declined|canceled|cancelled|overdue)/.test(t)) return "falhou"
  if (/(created|pending|waiting|issued|generated)/.test(t) && t.startsWith("invoice")) return "pendente"
  if (/^(pending|waiting|unpaid|open)$/.test(status)) return "pendente"
  return "outro"
}

export function personId(p: { phone: string; email: string }): string {
  if (p.phone) return "t" + p.phone
  if (p.email) return "e" + p.email.replace(/[^a-z0-9@._-]/g, "")
  return ""
}
