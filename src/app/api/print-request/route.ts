import { NextResponse } from "next/server"
import { rateLimit, getClientIp, isValidEmail } from "@/lib/apiSecurity"
import { sendEmail } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)
    if (!rateLimit(`print-request:${ip}`, 5, 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Trop de requêtes, réessayez plus tard." }, { status: 429 })
    }

    const { photoTitle, photoId, name, email, message, company } = await req.json()

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
    const body = [
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

    await sendEmail({ replyTo: email, subject, text: body })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
