import { NextResponse } from "next/server"
import { rateLimit, getClientIp, isValidEmail } from "@/lib/apiSecurity"
import { sendEmail } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)
    if (!rateLimit(`order:${ip}`, 5, 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Trop de requêtes, réessayez plus tard." }, { status: 429 })
    }

    const body = await req.json()
    const { product, collection, format, qty, unitPrice, total, currency, paymentUrl, name, email, phone, message, company } = body

    // Honeypot: real users never fill this hidden field
    if (company) {
      return NextResponse.json({ ok: true })
    }

    if (!name || !email || !product) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 })
    }

    const curr = currency === "EUR" ? "€" : currency
    const subject = `[COMMANDE] ${product} — ${format ?? ""} × ${qty}`

    const textBody = [
      `━━━ DEMANDE DE COMMANDE ━━━`,
      ``,
      `Produit    : ${product}`,
      `Collection : ${collection ?? "—"}`,
      `Format     : ${format ?? "—"}`,
      `Quantité   : ${qty}`,
      `Prix unit. : ${unitPrice}${curr}`,
      `TOTAL      : ${total}${curr}`,
      ``,
      `━━━ CLIENT ━━━`,
      `Nom        : ${name}`,
      `Email      : ${email}`,
      `Téléphone  : ${phone || "—"}`,
      ``,
      message ? `Message :\n${message}` : "",
      ``,
      paymentUrl ? `Lien de paiement configuré : ${paymentUrl}` : `⚠️  Aucun lien de paiement configuré — répondre manuellement.`,
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
