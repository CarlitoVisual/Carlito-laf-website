import { NextResponse } from "next/server"
import { rateLimit, getClientIp, isValidEmail } from "@/lib/apiSecurity"
import { sendEmail } from "@/lib/email"
import { LEGAL } from "@/lib/legal"
import { stripLinks } from "@/lib/safe"

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
    const rawDate = clean(body.orderDate, 10)
    const orderDate = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : ""
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

    // Limite anti-abus sur l'accusé de réception envoyé à l'adresse saisie (voir plus bas)
    const recipientOk =
      rateLimit(`withdrawal-ack:${email.toLowerCase()}`, 2, 24 * 60 * 60 * 1000) &&
      rateLimit(`withdrawal-ack:global`, 30, 24 * 60 * 60 * 1000)

    // 1. Notification au vendeur
    await sendEmail({
      replyTo: email,
      subject: `[RÉTRACTATION] ${order} — ${name}`,
      text: recipientOk
        ? declaration
        : `⚠️ Accusé de réception automatique NON envoyé (limite anti-abus atteinte) : si la demande est légitime, répondez à cet e-mail pour en accuser réception.\n\n${declaration}`,
    })

    // 2. Accusé de réception au consommateur, sur support durable (e-mail).
    // Sécurité : ce message part vers une adresse saisie par l'internaute. Pour qu'il ne puisse pas
    // servir de relais de spam, il ne reprend aucun lien ni le commentaire libre, et chaque adresse
    // ne peut recevoir qu'un nombre limité d'accusés (la notification au vendeur, elle, part toujours).
    if (!recipientOk) {
      return NextResponse.json({ ok: true, submittedAt })
    }
    const safeName = stripLinks(name).slice(0, 60)
    const ackDeclaration = [
      `Je notifie par la présente ma rétractation du contrat suivant :`,
      ``,
      `Commande / contrat : ${stripLinks(order)}`,
      `Date de commande : ${orderDate || "non précisée"}`,
      `Nom : ${safeName}`,
      `E-mail : ${email}`,
      ``,
      `Déclaration envoyée le ${submittedAt} (heure de Paris) via ${LEGAL.website}/retractation.`,
    ].join("\n")

    await sendEmail({
      to: email,
      replyTo: LEGAL.contactEmail,
      subject: `Accusé de réception de votre rétractation — ${LEGAL.brand}`,
      text: [
        `Bonjour ${safeName},`,
        ``,
        `J’accuse réception de votre déclaration de rétractation, résumée ci-dessous.`,
        ``,
        `────────────────────────`,
        ackDeclaration,
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
