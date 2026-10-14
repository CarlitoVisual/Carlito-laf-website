import { NextResponse } from "next/server"
import { rateLimit, getClientIp, isValidEmail } from "@/lib/apiSecurity"
import { sendEmail } from "@/lib/email"
import { client } from "@/lib/sanity.client"
import { isFormatAvailable } from "@/lib/shop"
import type { ProductFormat } from "@/types/sanity"

const MAX_QTY = 5

type OrderProduct = {
  _id: string
  title: string
  price?: number
  currency?: string
  paymentUrl?: string
  collection?: string
  formats?: ProductFormat[]
}

const PRODUCT_QUERY = `*[_type == "product" && _id == $id][0]{
  _id, title, price, currency, paymentUrl, formats[]{ name, price, stock },
  "collection": coalesce(collection->title, photo->collection->title)
}`

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)
    if (!rateLimit(`order:${ip}`, 5, 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Trop de requêtes, réessayez plus tard." }, { status: 429 })
    }

    const body = await req.json()
    const { productId, format, qty: rawQty, name, email, phone, message, company, acceptCgv } = body

    // Honeypot: real users never fill this hidden field
    if (company) {
      return NextResponse.json({ ok: true })
    }

    if (!name || !email || typeof productId !== "string" || !productId) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 })
    }

    if (acceptCgv !== true) {
      return NextResponse.json({ error: "Veuillez accepter les conditions générales de vente" }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 })
    }

    // Prices, stock and payment link always come from Sanity, never from the browser
    const product = await client.fetch<OrderProduct | null>(PRODUCT_QUERY, { id: productId })
    if (!product) {
      return NextResponse.json({ error: "Produit introuvable" }, { status: 404 })
    }

    let unitPrice: number | undefined
    let formatName: string | undefined
    let stockLimit = MAX_QTY

    if (product.formats?.length) {
      const selected = product.formats.find((f) => f.name === format)
      if (!selected) {
        return NextResponse.json({ error: "Format invalide" }, { status: 400 })
      }
      if (!isFormatAvailable(selected)) {
        return NextResponse.json({ error: "Ce format n’est plus disponible" }, { status: 409 })
      }
      unitPrice = selected.price ?? product.price
      formatName = selected.name
      stockLimit = Math.min(selected.stock ?? MAX_QTY, MAX_QTY)
    } else {
      unitPrice = product.price
    }

    const qty = Number(rawQty)
    if (!Number.isInteger(qty) || qty < 1 || qty > stockLimit) {
      return NextResponse.json({ error: "Quantité invalide" }, { status: 400 })
    }

    if (typeof unitPrice !== "number") {
      return NextResponse.json({ error: "Prix non défini pour ce produit" }, { status: 400 })
    }

    const currency = product.currency || "EUR"
    const curr = currency === "EUR" ? "€" : currency
    const total = unitPrice * qty
    const subject = `[COMMANDE] ${product.title} — ${formatName ?? ""} × ${qty}`

    const textBody = [
      `━━━ DEMANDE DE COMMANDE ━━━`,
      ``,
      `Produit    : ${product.title}`,
      `Collection : ${product.collection ?? "—"}`,
      `Format     : ${formatName ?? "—"}`,
      `Quantité   : ${qty}`,
      `Prix unit. : ${unitPrice}${curr}`,
      `TOTAL      : ${total}${curr}`,
      `CGV        : acceptées le ${new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}`,
      ``,
      `━━━ CLIENT ━━━`,
      `Nom        : ${name}`,
      `Email      : ${email}`,
      `Téléphone  : ${phone || "—"}`,
      ``,
      message ? `Message :\n${message}` : "",
      ``,
      product.paymentUrl
        ? `Lien de paiement configuré : ${product.paymentUrl}`
        : `⚠️  Aucun lien de paiement configuré — répondre manuellement.`,
    ]
      .filter(Boolean)
      .join("\n")

    await sendEmail({ replyTo: email, subject, text: textBody })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Order API error:", err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
