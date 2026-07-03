import { NextResponse } from "next/server"
import { rateLimit, getClientIp, isValidEmail } from "@/lib/apiSecurity"
import { sendEmail } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)
    if (!rateLimit(`contact:${ip}`, 5, 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Trop de requêtes, réessayez plus tard." }, { status: 429 })
    }

    const body = await req.json()
    const { name, email, phone, projectType, location, date, budget, message, isDevis, company } = body

    // Honeypot: real users never fill this hidden field
    if (company) {
      return NextResponse.json({ ok: true })
    }

    if (!name || !email || !message || !projectType) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 })
    }

    const subject = isDevis
      ? `[DEVIS] ${projectType} — ${name}`
      : `[CONTACT] ${name}`

    const textBody = [
      `Nom: ${name}`,
      `Email: ${email}`,
      `Téléphone: ${phone || "Non renseigné"}`,
      `Type de projet: ${projectType}`,
      isDevis && `Lieu: ${location || "Non renseigné"}`,
      isDevis && `Date: ${date || "Non renseignée"}`,
      isDevis && `Budget: ${budget || "Non défini"}`,
      ``,
      `Message:`,
      message,
    ]
      .filter(Boolean)
      .join("\n")

    await sendEmail({ replyTo: email, subject, text: textBody })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Contact form error:", err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
