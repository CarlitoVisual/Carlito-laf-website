import { NextResponse } from "next/server"
import { rateLimit, getClientIp, isValidEmail } from "@/lib/apiSecurity"
import { sendEmail } from "@/lib/email"
import { cleanText } from "@/lib/safe"

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)
    if (!rateLimit(`print-request:${ip}`, 5, 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Trop de requêtes, réessayez plus tard." }, { status: 429 })
    }

    const body = await req.json()
    const company = body.company
    const photoTitle = cleanText(body.photoTitle, 200) || undefined
    const photoId = cleanText(body.photoId, 120) || undefined
    const name = cleanText(body.name, 120)
    const email = cleanText(body.email, 200)
    const message = cleanText(body.message, 3000)

    // Honeypot: real users never fill this hidden field
    if (company) {
      return NextResponse.json({ ok: true })
    }

    if (!name || !email) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 })
    }

    const subject = `[TIRAGE SOUHAITÉ] ${photoTitle ?? photoId}`
    const text = [
      `━━━ DEMANDE DE TIRAGE ━━━`,
      ``,
      `Photo      : ${photoTitle ?? "Sans titre"}`,
      `ID Sanity  : ${photoId ?? "—"}`,
      ``,
      `━━━ CLIENT ━━━`,
      `Nom        : ${name}`,
      `Email      : ${email}`,
      message ? `\nMessage :\n${message}` : "",
    ].filter(s => s !== undefined).join("\n")

    await sendEmail({ replyTo: email, subject, text })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
