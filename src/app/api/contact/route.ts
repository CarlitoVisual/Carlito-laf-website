import { NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { rateLimit, getClientIp, isValidEmail } from "@/lib/apiSecurity"
import { sendEmail } from "@/lib/email"
import { client } from "@/lib/sanity.client"
import { writeClient } from "@/lib/sanity.write"
import { estimateDistanceKm } from "@/lib/geo"
import { LEGAL } from "@/lib/legal"
import {
  computeQuote,
  euro,
  DURATION_KEYS,
  SERVICE_KEYS,
  SERVICE_LABELS,
  type DurationKey,
  type PriceGrid,
  type QuoteDraft,
  type ServiceKey,
} from "@/lib/quote"

const str = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "")
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!)

const SITE = process.env.NEXT_PUBLIC_SITE_URL || LEGAL.website
const STUDIO = process.env.SANITY_STUDIO_URL || "https://www.sanity.io/@oJeBtuZVP/studio/q8qecvlyvss306uhjfo40wmb"

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)
    if (!rateLimit(`contact:${ip}`, 5, 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Trop de requêtes, réessayez plus tard." }, { status: 429 })
    }

    const body = await req.json()
    if (body.company) return NextResponse.json({ ok: true }) // honeypot

    const name = str(body.name, 120)
    const email = str(body.email, 200)
    const phone = str(body.phone, 40)
    const PROJECT_LABELS: Record<string, string> = {
      "photo-aventure": "Reportage photo aventure",
      "video-aventure": "Film vidéo aventure",
      "sports-nautiques": "Sports nautiques",
      evenement: "Couverture d’événement",
      commercial: "Contenu commercial / marque",
      "fine-art": "Tirage Fine Art",
      autre: "Autre",
    }
    const projectTypeRaw = str(body.projectType, 60)
    const projectType = PROJECT_LABELS[projectTypeRaw] ?? projectTypeRaw
    const location = str(body.location, 160)
    const date = str(body.date, 80)
    const budget = str(body.budget, 40)
    const message = str(body.message, 5000)
    const isDevis = body.isDevis === true

    if (!name || !email || !message || !projectType) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 })
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 })
    }

    // ── Simple message de contact ──
    if (!isDevis) {
      const text = [`Nom: ${name}`, `Email: ${email}`, `Téléphone: ${phone || "Non renseigné"}`, `Type de projet: ${projectType}`, ``, `Message:`, message].join("\n")
      await sendEmail({ replyTo: email, subject: `[CONTACT] ${name}`, text })
      return NextResponse.json({ ok: true })
    }

    // ── Demande de devis : pré-chiffrage automatique ──
    const duration = (DURATION_KEYS as string[]).includes(body.duration) ? (body.duration as DurationKey) : null
    const services = Array.isArray(body.services)
      ? (body.services as unknown[]).filter((s): s is ServiceKey => typeof s === "string" && (SERVICE_KEYS as string[]).includes(s))
      : []
    const usage = body.usage === "commercial" ? "commercial" : "private"
    const express = body.express === true

    const [grid, geo] = await Promise.all([
      client.fetch<PriceGrid | null>(`*[_id == "priceGrid"][0]`),
      location ? estimateDistanceKm(location) : Promise.resolve(null),
    ])

    let draft: QuoteDraft | null = null
    if (grid && duration) {
      draft = computeQuote(grid, { duration, services, usage, express, distanceKm: geo?.km ?? null })
    }

    // Enregistrement du brouillon dans Sanity (si le jeton d'écriture est configuré)
    const now = new Date()
    const accessKey = randomBytes(18).toString("base64url")
    let devisId: string | null = null
    let number = ""
    if (writeClient && draft) {
      const year = now.getFullYear()
      const count = await writeClient.fetch<number>(`count(*[_type == "devis" && number match $p])`, { p: `D-${year}-*` })
      number = `D-${year}-${String(count + 1).padStart(4, "0")}`
      const validity = grid?.validityDays ?? 30
      const validUntil = new Date(now.getTime() + validity * 86400000)
      const doc = await writeClient.create({
        // Identifiant « à point » : document privé, illisible sans jeton (données personnelles)
        _id: `devis.${randomBytes(12).toString("hex")}`,
        _type: "devis",
        number,
        status: "draft",
        issuedAt: now.toISOString().slice(0, 10),
        validUntil: validUntil.toISOString().slice(0, 10),
        client: { name, email, phone: phone || undefined },
        title: `${projectType}${location ? ` — ${location}` : ""}`,
        lines: draft.lines,
        message: `Bonjour ${name.split(" ")[0]},\n\nMerci pour votre demande. Voici ma proposition pour votre projet${location ? ` à ${location}` : ""}${date ? ` (${date})` : ""}.\n\nJe reste disponible pour l’ajuster à vos besoins.\n\nCharles — ${LEGAL.brand}`,
        internalNotes: draft.warnings.join("\n"),
        accessKey,
        request: {
          projectType,
          duration,
          services: services.map((s) => SERVICE_LABELS[s]),
          usage: usage === "commercial" ? "Commercial" : "Privé",
          express,
          location: geo ? `${location} (${geo.label})` : location,
          distanceKm: geo?.km,
          date,
          budget,
          message,
          receivedAt: now.toISOString(),
        },
      })
      devisId = doc._id
    }

    // ── E-mail de contrôle à Carlito ──
    const previewUrl = devisId ? `${SITE}/devis/apercu/${devisId}?k=${accessKey}` : null
    const studioUrl = devisId ? `${STUDIO}/intent/edit/id=${devisId};type=devis` : null
    const subject = `[DEVIS À VALIDER] ${number || projectType} — ${name}${draft ? ` — ${euro(draft.total)}` : ""}`

    const requestLines = [
      `Client : ${name} <${email}>${phone ? ` — ${phone}` : ""}`,
      `Projet : ${projectType}`,
      `Durée : ${(duration && grid?.durations?.find((d) => d.key === duration)?.label) || duration || "non précisée"}`,
      `Prestations : ${services.map((s) => SERVICE_LABELS[s]).join(", ") || "—"}`,
      `Usage : ${usage === "commercial" ? "commercial" : "privé"}${express ? " · livraison express" : ""}`,
      `Lieu : ${location || "—"}${geo ? ` (≈ ${geo.km} km de Bidart)` : location ? " (non localisé)" : ""}`,
      `Date : ${date || "—"} · Budget indiqué : ${budget || "—"}`,
      ``,
      `Message :`,
      message,
    ]

    const text = [
      `━━━ NOUVELLE DEMANDE DE DEVIS ━━━`,
      ...requestLines,
      ``,
      `━━━ PRÉ-CHIFFRAGE AUTOMATIQUE (à vérifier) ━━━`,
      ...(draft
        ? [...draft.lines.map((l) => `- ${l.label} : ${l.qty} × ${euro(l.unitPrice)} = ${euro(l.qty * l.unitPrice)}`), `TOTAL : ${euro(draft.total)} (${LEGAL.vat})`]
        : ["Pas de pré-chiffrage (durée ou grille tarifaire manquante)."]),
      ...(draft?.warnings.length ? [``, `⚠️ Points à vérifier :`, ...draft.warnings.map((w) => `- ${w}`)] : []),
      ``,
      previewUrl ? `Aperçu imprimable / PDF : ${previewUrl}` : `(Brouillon non enregistré dans Sanity : jeton d'écriture manquant)`,
      studioUrl ? `Modifier dans le Studio : ${studioUrl}` : ``,
      ``,
      `Rien n'a été envoyé au client. Répondre à cet e-mail écrit directement au client.`,
    ].join("\n")

    const td = 'style="padding:8px 10px;border-bottom:1px solid #e5e5e5;font-size:14px"'
    const html = `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:680px;margin:auto;color:#111">
  <p style="background:#E3C79B;color:#051B2E;padding:10px 14px;border-radius:8px;font-weight:bold">Brouillon de devis à valider — rien n’a été envoyé au client</p>
  <h2 style="margin:18px 0 6px">${esc(number || "Nouvelle demande")} — ${esc(name)}</h2>
  <pre style="white-space:pre-wrap;font-family:inherit;background:#f6f6f6;padding:12px;border-radius:8px">${esc(requestLines.join("\n"))}</pre>
  ${
    draft
      ? `<h3>Pré-chiffrage automatique</h3>
  <table style="width:100%;border-collapse:collapse">
    <tr><th align="left" ${td}>Désignation</th><th align="right" ${td}>Qté</th><th align="right" ${td}>P.U.</th><th align="right" ${td}>Total</th></tr>
    ${draft.lines
      .map((l) => `<tr><td ${td}>${esc(l.label)}${l.detail ? `<br><small style="color:#666">${esc(l.detail)}</small>` : ""}</td><td align="right" ${td}>${l.qty}</td><td align="right" ${td}>${euro(l.unitPrice)}</td><td align="right" ${td}>${euro(l.qty * l.unitPrice)}</td></tr>`)
      .join("")}
    <tr><td colspan="3" align="right" ${td}><strong>Total</strong></td><td align="right" ${td}><strong>${euro(draft.total)}</strong></td></tr>
  </table>
  <p style="font-size:12px;color:#666">${esc(LEGAL.vat)}</p>
  ${draft.warnings.length ? `<p><strong>⚠️ À vérifier :</strong></p><ul>${draft.warnings.map((w) => `<li>${esc(w)}</li>`).join("")}</ul>` : ""}`
      : `<p><em>Pas de pré-chiffrage (durée ou grille tarifaire manquante).</em></p>`
  }
  <p style="margin-top:24px">
    ${previewUrl ? `<a href="${previewUrl}" style="background:#051B2E;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;display:inline-block;margin:0 8px 8px 0">Voir le devis (PDF)</a>` : ""}
    ${studioUrl ? `<a href="${studioUrl}" style="border:1px solid #051B2E;color:#051B2E;padding:11px 18px;border-radius:999px;text-decoration:none;display:inline-block">Modifier dans le Studio</a>` : ""}
  </p>
  <p style="font-size:12px;color:#666">Répondre à cet e-mail écrit directement au client (${esc(email)}).</p>
</div>`

    await sendEmail({ replyTo: email, subject, text, html })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Contact form error:", err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
