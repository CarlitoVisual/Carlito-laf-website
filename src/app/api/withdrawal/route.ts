import { NextResponse } from "next/server"
import { rateLimit, getClientIp, isValidEmail } from "@/lib/apiSecurity"
import { sendEmail } from "@/lib/email"
import { LEGAL } from "@/lib/legal"

const MAX = 500

function clean(v: unknown, max = MAX): string {
  return typeof v === "string" ? v.trim().slice(0, max) : ""
}

/** Fonction de rétractation en ligne (art. L221-21 du Code de la consommation). */
export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)
    if (!rateLimit(`withdrawal:${ip}`, 5, 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Trop de requêtes, réessayez plus tard." }, { status: 429 })
    }

    const body = await req.json()
    if (body.company) return NextResponse.json({ ok: true }) // honeypot

    const name = clean(body.name, 120)
    const email = clean(body.email, 200)
    const order = clean(body.order, 300)
    const orderDate = clean(body.orderDate, 40)
    const comment = clean(body.comment, 1000)

    if (!name || !email || !order) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 })
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 })
    }

    const submittedAt = new Date().toLocaleString("fr-FR", {
      timeZone: "Europe/Paris",
      dateStyle: "full",
      timeStyle: "medium",
    })

    const declaration = [
      `Je notifie par la présente ma rétractation du contrat suivant :`,
      ``,
      `Commande / contrat : ${order}`,
      `Date de commande : ${orderDate || "non précisée"}`,
      `Nom : ${name}`,
      `E-mail : ${email}`,
      comment ? `Commentaire : ${comment}` : "",
      ``,
      `Déclaration envoyée le ${submittedAt} (heure de Paris) via ${LEGAL.website}/retractation.`,
    ]
      .filter((l) => l !== "")
      .join("\n")

    // 1. Notification au vendeur
    await sendEmail({
      replyTo: email,
      subject: `[RÉTRACTATION] ${order} — ${name}`,
      text: declaration,
    })

    // 2. Accusé de réception au consommateur, sur support durable (e-mail)
    await sendEmail({
      to: email,
      replyTo: LEGAL.contactEmail,
      subject: `Accusé de réception de votre rétractation — ${LEGAL.brand}`,
      text: [
        `Bonjour ${name},`,
        ``,
        `J’accuse réception de votre déclaration de rétractation, reproduite ci-dessous.`,
        ``,
        `────────────────────────`,
        declaration,
        `────────────────────────`,
        ``,
        `Prochaines étapes :`,
        `- Pour un tirage : renvoyez-le dans son emballage d’origine sous 14 jours. Je vous indique l’adresse de retour en réponse à ce message.`,
        `- Le remboursement intégral (livraison standard comprise) intervient au plus tard 14 jours après la date ci-dessus, avec le moyen de paiement utilisé ; pour un tirage, il peut attendre la réception du retour ou la preuve de son expédition.`,
        ``,
        `Conditions complètes : ${LEGAL.website}/cgv#retractation`,
        ``,
        `${LEGAL.ownerName} — ${LEGAL.brand}`,
      ].join("\n"),
    })

    return NextResponse.json({ ok: true, submittedAt })
  } catch (err) {
    console.error("Withdrawal API error:", err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
