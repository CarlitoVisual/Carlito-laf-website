import { createHmac, timingSafeEqual } from "node:crypto"

/**
 * Accès minimal à l'API Stripe par fetch (pas de dépendance npm) : création de sessions Checkout,
 * lecture de sessions / paiements, vérification de la signature des webhooks.
 *
 * Variables d'environnement (serveur uniquement) :
 * - STRIPE_SECRET_KEY : clé restreinte rk_test_… (Preview) ou rk_live_… (Production)
 * - STRIPE_WEBHOOK_SECRET : secret de signature whsec_… du point de terminaison webhook
 */
const API = "https://api.stripe.com/v1"

export const stripeEnabled = () => Boolean(process.env.STRIPE_SECRET_KEY)

type Params = Record<string, unknown>

/** Encode un objet en paramètres de formulaire au format Stripe (a[b][0][c]=…). */
export function encodeParams(params: Params, prefix = ""): string[] {
  const out: string[] = []
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    const name = prefix ? `${prefix}[${key}]` : key
    if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (item !== null && typeof item === "object") out.push(...encodeParams(item as Params, `${name}[${i}]`))
        else out.push(`${encodeURIComponent(`${name}[${i}]`)}=${encodeURIComponent(String(item))}`)
      })
    } else if (typeof value === "object") {
      out.push(...encodeParams(value as Params, name))
    } else {
      out.push(`${encodeURIComponent(name)}=${encodeURIComponent(String(value))}`)
    }
  }
  return out
}

export class StripeError extends Error {
  status: number
  code?: string
  constructor(message: string, status: number, code?: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

/** Appel à l'API Stripe. GET : `params` passe dans l'URL ; POST : dans le corps. */
export async function stripeApi<T>(
  method: "GET" | "POST",
  path: string,
  params: Params = {},
  opts: { idempotencyKey?: string } = {},
): Promise<T> {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new StripeError("STRIPE_SECRET_KEY manquante", 503)
  const query = encodeParams(params).join("&")
  const url = method === "GET" && query ? `${API}${path}?${query}` : `${API}${path}`
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      ...(method === "POST" ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
      ...(opts.idempotencyKey ? { "Idempotency-Key": opts.idempotencyKey } : {}),
    },
    body: method === "POST" ? query : undefined,
    cache: "no-store",
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = (data as { error?: { message?: string; code?: string } }).error
    throw new StripeError(err?.message ?? `Stripe ${res.status}`, res.status, err?.code)
  }
  return data as T
}

/**
 * Vérifie l'en-tête « Stripe-Signature » d'un webhook (HMAC-SHA256 de « t.payload » avec le secret whsec_).
 * Rejette les signatures de plus de 5 minutes (rejeu).
 */
export function verifyStripeSignature(payload: string, header: string | null, secret: string, toleranceSec = 300): boolean {
  if (!header || !secret) return false
  const parts = header.split(",").map((p) => p.trim().split("="))
  const t = parts.find(([k]) => k === "t")?.[1]
  const signatures = parts.filter(([k]) => k === "v1").map(([, v]) => v)
  if (!t || !signatures.length) return false
  const ts = Number(t)
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > toleranceSec) return false
  const expected = createHmac("sha256", secret).update(`${t}.${payload}`, "utf8").digest()
  return signatures.some((sig) => {
    const buf = Buffer.from(sig ?? "", "hex")
    return buf.length === expected.length && timingSafeEqual(buf, expected)
  })
}

/* ── Types minimaux des objets Stripe utilisés ─────────────────────────── */

export type StripeAddress = {
  line1?: string | null
  line2?: string | null
  postal_code?: string | null
  city?: string | null
  country?: string | null
}

export type CheckoutSession = {
  id: string
  url?: string | null
  mode: string
  status?: string | null
  payment_status: "paid" | "unpaid" | "no_payment_required"
  amount_total?: number | null
  currency?: string | null
  created: number
  metadata?: Record<string, string> | null
  payment_intent?: string | { id: string } | null
  customer_details?: { name?: string | null; email?: string | null; phone?: string | null } | null
  // Selon la version d'API, l'adresse de livraison est ici…
  collected_information?: { shipping_details?: { name?: string | null; address?: StripeAddress | null } | null } | null
  // … ou là (anciennes versions)
  shipping_details?: { name?: string | null; address?: StripeAddress | null } | null
}

export type StripeEvent = {
  id: string
  type: string
  livemode: boolean
  data: { object: Record<string, unknown> }
}

/** Montant Stripe (centimes) → euros. */
export const fromCents = (v: number | null | undefined) => Math.round(v ?? 0) / 100

export function sessionShipping(s: CheckoutSession) {
  return s.collected_information?.shipping_details ?? s.shipping_details ?? null
}

export function paymentIntentId(s: CheckoutSession): string | undefined {
  const pi = s.payment_intent
  return typeof pi === "string" ? pi : pi?.id
}
