import { NextResponse } from "next/server"
import { writeClient } from "@/lib/sanity.write"
import { sendEmail } from "@/lib/email"
import { LEGAL } from "@/lib/legal"
import { formatPrice, printPaperLabel } from "@/lib/shop"
import { urlFor } from "@/lib/image"
import { customerOrderEmail, esc } from "@/lib/orderEmail"
import type { SanityImage } from "@/types/sanity"
import {
  fromCents,
  paymentIntentId,
  sessionShipping,
  stripeApi,
  verifyStripeSignature,
  type CheckoutSession,
  type StripeEvent,
} from "@/lib/stripe"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const STUDIO = process.env.SANITY_STUDIO_URL || "https://www.sanity.io/@oJeBtuZVP/studio/q8qecvlyvss306uhjfo40wmb"

type ProductInfo = {
  _id: string
  title?: string
  paper?: string
  image?: SanityImage
  formats?: { _key: string; name?: string; stock?: number }[]
}

/** Numéro de commande séquentiel par année (compteur atomique privé, même principe que les devis). */
async function nextOrderSeq(year: number): Promise<number> {
  if (!writeClient) throw new Error("writeClient manquant")
  const id = `counter.commande-${year}`
  if (!(await writeClient.getDocument(id))) {
    await writeClient.createIfNotExists({ _id: id, _type: "counter", seq: 0 })
  }
  const doc = await writeClient.patch(id).inc({ seq: 1 }).commit<{ seq: number }>()
  return doc.seq
}

/** Frais Stripe du paiement (facultatif : ignoré si la clé n'a pas les droits de lecture). */
async function stripeFee(piId: string | undefined): Promise<number | undefined> {
  if (!piId) return undefined
  try {
    const pi = await stripeApi<{ latest_charge?: { balance_transaction?: { fee?: number } | null } | null }>(
      "GET",
      `/payment_intents/${piId}`,
      { expand: ["latest_charge.balance_transaction"] },
    )
    const fee = pi.latest_charge?.balance_transaction?.fee
    return typeof fee === "number" ? fromCents(fee) : undefined
  } catch {
    return undefined
  }
}

/** Commande payée → document privé `order.<session>` dans Sanity, stock mis à jour, e-mails envoyés. */
async function handlePaidSession(session: CheckoutSession) {
  if (!writeClient) throw new Error("SANITY_API_WRITE_TOKEN manquant")
  if (session.mode !== "payment" || session.payment_status !== "paid") return

  const orderId = `order.${session.id}`
  if (await writeClient.getDocument(orderId)) return // déjà traité (Stripe peut renvoyer un événement)

  const meta = session.metadata ?? {}
  const productId = meta.productId
  const formatName = meta.format || undefined
  const formatKey = meta.formatKey || undefined
  const qty = Number(meta.qty) || 1
  const unitPrice = Number(meta.unitPrice) || fromCents(session.amount_total) / qty
  const total = fromCents(session.amount_total)

  const product = productId
    ? await writeClient.fetch<ProductInfo | null>(`*[_id == $id][0]{ _id, title, paper, "image": coalesce(image, photo->image), formats[]{ _key, name, stock } }`, { id: productId })
    : null

  const paper = printPaperLabel(meta.range, meta.finish, product?.paper)
  const paidAt = new Date((session.created ?? Date.now() / 1000) * 1000)
  const year = paidAt.getFullYear()
  const number = `C-${year}-${String(await nextOrderSeq(year)).padStart(4, "0")}`
  const piId = paymentIntentId(session)
  const fee = await stripeFee(piId)
  const customer = session.customer_details ?? {}
  const ship = sessionShipping(session)
  const addr = ship?.address ?? {}

  const created = await writeClient.createIfNotExists({
    _id: orderId,
    _type: "order",
    number,
    status: "paid",
    paidAt: paidAt.toISOString(),
    items: [
      {
        _key: "item1",
        _type: "orderItem",
        ...(product ? { product: { _type: "reference", _ref: product._id, _weak: true } } : {}),
        title: product?.title ?? "Tirage",
        format: formatName,
        paper: paper,
        qty,
        unitPrice,
      },
    ],
    total,
    customer: { name: customer.name ?? undefined, email: customer.email ?? undefined, phone: customer.phone ?? undefined },
    shippingAddress: {
      name: ship?.name ?? customer.name ?? undefined,
      line1: addr.line1 ?? undefined,
      line2: addr.line2 ?? undefined,
      postalCode: addr.postal_code ?? undefined,
      city: addr.city ?? undefined,
      country: addr.country ?? undefined,
    },
    stripe: { sessionId: session.id, paymentIntentId: piId, ...(fee !== undefined ? { fee } : {}) },
  })
  // Un autre envoi du même événement a gagné la course : rien d'autre à faire
  if (created.number !== number) return

  // Stock : seulement si le format a un stock chiffré (vide = tirage à la demande, illimité)
  const fmt = product?.formats?.find((f) => (formatKey ? f._key === formatKey : f.name === formatName))
  if (product && fmt && typeof fmt.stock === "number") {
    await writeClient
      .patch(product._id)
      .set({ [`formats[_key=="${fmt._key}"].stock`]: Math.max(0, fmt.stock - qty) })
      .commit()
      .catch((e) => console.error("Stock non mis à jour:", e))
  }

  const title = product?.title ?? "Tirage"
  const fmtLine = formatName ? `${formatName} cm` : "—"
  const addressList = [ship?.name ?? customer.name, addr.line1, addr.line2, `${addr.postal_code ?? ""} ${addr.city ?? ""}`.trim(), addr.country === "FR" ? "France" : addr.country].filter(
    (l): l is string => Boolean(l),
  )
  const addressLines = addressList.join("\n")
  // Photo commandée, en JPEG (format lu par tous les logiciels de messagerie)
  const imageUrl = product?.image ? urlFor(product.image).width(1120).fit("max").format("jpg").quality(80).url() : undefined
  const studioLink = `${STUDIO}/intent/edit/id=${encodeURIComponent(orderId)};type=order`

  // E-mail pour Carlito : tout ce qu'il faut pour passer la commande chez Saal
  await sendEmail({
    to: process.env.CONTACT_EMAIL || LEGAL.contactEmail,
    replyTo: customer.email || LEGAL.contactEmail,
    subject: `[COMMANDE PAYÉE] ${number} — ${title} ${fmtLine} × ${qty} — ${formatPrice(total)}`,
    text: [
      `━━━ COMMANDE ${number} — PAYÉE ━━━`,
      ``,
      `Tirage     : ${title}`,
      `Format     : ${fmtLine}`,
      `Papier     : ${paper}`,
      `Quantité   : ${qty}`,
      `Total payé : ${formatPrice(total)}${fee !== undefined ? ` (frais Stripe ${formatPrice(fee)})` : ""}`,
      ``,
      `━━━ À COMMANDER CHEZ SAAL — LIVRAISON À ━━━`,
      addressLines,
      `Tél. : ${customer.phone ?? "—"}`,
      `E-mail : ${customer.email ?? "—"}`,
      ``,
      `Suivi dans le Studio : ${studioLink}`,
      `Paiement Stripe : https://dashboard.stripe.com/${session.id.startsWith("cs_test_") ? "test/" : ""}payments/${piId ?? ""}`,
    ].join("\n"),
    html: `<div style="font-family:Helvetica,Arial,sans-serif;color:#051B2E;font-size:14px;line-height:1.6;max-width:600px">
      <h2 style="margin:0 0 8px">Commande ${esc(number)} — payée</h2>
      ${imageUrl ? `<img src="${esc(imageUrl)}" width="280" alt="${esc(title)}" style="display:block;width:280px;height:auto;border-radius:6px;margin:8px 0 12px">` : ""}
      <p style="margin:0"><strong>${esc(title)}</strong><br>${esc(fmtLine)} · ${esc(paper)} · × ${esc(qty)}<br>
      Total payé : <strong>${esc(formatPrice(total))}</strong>${fee !== undefined ? ` (frais Stripe ${esc(formatPrice(fee))})` : ""}</p>
      <h3 style="margin:18px 0 4px">À commander chez Saal — livraison à</h3>
      <p style="margin:0">${addressList.map(esc).join("<br>")}<br>Tél. : ${esc(customer.phone ?? "—")}<br>E-mail : ${esc(customer.email ?? "—")}</p>
      <p style="margin:18px 0 0"><a href="${esc(studioLink)}" style="color:#136093">Ouvrir la commande dans le Studio</a> ·
      <a href="https://dashboard.stripe.com/${session.id.startsWith("cs_test_") ? "test/" : ""}payments/${esc(piId ?? "")}" style="color:#136093">Paiement Stripe</a></p>
    </div>`,
  })

  // Confirmation pour le client, avec la photo commandée
  if (customer.email) {
    const mail = customerOrderEmail({
      number,
      firstName: (customer.name ?? "").split(" ")[0] || undefined,
      title,
      formatLine: fmtLine,
      paper: paper,
      qty,
      total,
      imageUrl,
      addressLines: addressList,
    })
    await sendEmail({ to: customer.email, replyTo: LEGAL.contactEmail, ...mail }).catch((e) =>
      console.error("Confirmation client non envoyée:", e),
    )
  }
}

/** Remboursement depuis le tableau de bord Stripe → commande « Remboursée ». */
async function handleRefund(charge: { payment_intent?: string | null; amount_refunded?: number; amount?: number }) {
  if (!writeClient || !charge.payment_intent) return
  const id = await writeClient.fetch<string | null>(`*[_type == "order" && stripe.paymentIntentId == $pi][0]._id`, { pi: charge.payment_intent })
  if (!id) return
  const refunded = fromCents(charge.amount_refunded)
  const full = (charge.amount_refunded ?? 0) >= (charge.amount ?? 0)
  await writeClient
    .patch(id)
    .set(full ? { status: "refunded" } : { internalNotes: `Remboursement partiel de ${formatPrice(refunded)} via Stripe.` })
    .commit()
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: "Webhook non configuré" }, { status: 503 })

  const payload = await req.text()
  if (!verifyStripeSignature(payload, req.headers.get("stripe-signature"), secret)) {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 })
  }

  let event: StripeEvent
  try {
    event = JSON.parse(payload)
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await handlePaidSession(event.data.object as unknown as CheckoutSession)
        break
      case "charge.refunded":
        await handleRefund(event.data.object as { payment_intent?: string | null; amount_refunded?: number; amount?: number })
        break
      default:
        break // checkout.session.expired, etc. : rien à faire
    }
    return NextResponse.json({ received: true })
  } catch (err) {
    // Erreur → 500 : Stripe renverra l'événement (traitement idempotent)
    console.error(`Stripe webhook ${event.type} ${event.id}:`, err)
    return NextResponse.json({ error: "Erreur de traitement" }, { status: 500 })
  }
}
