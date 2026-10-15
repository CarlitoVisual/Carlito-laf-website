import { LEGAL } from "@/lib/legal"
import { formatPrice } from "@/lib/shop"

/** Échappe le texte inséré dans le HTML des e-mails (noms, adresses saisis par le client). */
export function esc(s: string | number | null | undefined): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export type OrderEmailData = {
  number: string
  firstName?: string
  title: string
  formatLine: string
  paper: string
  qty: number
  total: number
  /** URL JPEG de la photo (CDN Sanity), affichée dans l'e-mail */
  imageUrl?: string
  addressLines: string[]
}

// Charte « Swell Sable »
const C = { fosse: "#051B2E", ecume: "#F4EFE6", sable: "#E3C79B", vague: "#136093", muted: "#5B6B7A", border: "#E2D9CB" }
const FONT = "Helvetica, Arial, sans-serif"

/** E-mail de confirmation envoyé au client après paiement (texte + HTML avec la photo commandée). */
export function customerOrderEmail(d: OrderEmailData) {
  const subject = `Votre commande ${d.number} est confirmée — ${LEGAL.brand}`
  const hello = `Bonjour${d.firstName ? ` ${d.firstName}` : ""},`
  const delivery = `Votre tirage est imprimé à la commande par notre laboratoire partenaire, qui vous l’expédie directement. Vous le recevrez sous ${LEGAL.shipping.delay} au plus ; je vous envoie le numéro de suivi dès l’expédition.`

  const text = [
    hello,
    ``,
    `Merci pour votre commande ! Le paiement est bien reçu.`,
    ``,
    `Commande ${d.number}`,
    `${d.title} — ${d.formatLine}, ${d.paper} × ${d.qty}`,
    `Total payé : ${formatPrice(d.total)} (livraison offerte)`,
    ``,
    `Livraison à :`,
    ...d.addressLines,
    ``,
    delivery,
    ``,
    `Vous disposez de 14 jours après réception pour vous rétracter : ${LEGAL.website}/retractation`,
    `Conditions générales de vente : ${LEGAL.website}/cgv`,
    ``,
    `Une question ? Répondez simplement à cet e-mail.`,
    ``,
    `${LEGAL.ownerName} — ${LEGAL.brand}`,
    LEGAL.vat,
  ].join("\n")

  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 0;color:${C.muted};font-size:14px;width:120px;vertical-align:top">${label}</td><td style="padding:6px 0;color:${C.fosse};font-size:14px">${value}</td></tr>`

  const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:${C.ecume};font-family:${FONT}">
<div style="display:none;max-height:0;overflow:hidden">Commande ${esc(d.number)} confirmée — ${esc(d.title)}, livraison sous ${esc(LEGAL.shipping.delay)}.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.ecume}">
<tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid ${C.border}">
  <tr><td style="background:${C.fosse};padding:22px 28px;text-align:center">
    <a href="${esc(LEGAL.website)}" style="color:${C.ecume};font-size:20px;font-weight:700;letter-spacing:3px;text-decoration:none;text-transform:uppercase">${esc(LEGAL.brand)}</a>
  </td></tr>
  <tr><td style="padding:28px 28px 8px">
    <p style="margin:0 0 6px;color:${C.vague};font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:700">Commande ${esc(d.number)}</p>
    <h1 style="margin:0 0 14px;color:${C.fosse};font-size:24px;line-height:1.3">Merci pour votre commande !</h1>
    <p style="margin:0;color:${C.fosse};font-size:15px;line-height:1.6">${esc(hello)}<br>Le paiement est bien reçu. Voici le récapitulatif de votre tirage.</p>
  </td></tr>
  ${d.imageUrl ? `<tr><td style="padding:20px 28px 0"><img src="${esc(d.imageUrl)}" width="544" alt="${esc(d.title)}" style="display:block;width:100%;max-width:544px;height:auto;border-radius:8px;border:0"></td></tr>` : ""}
  <tr><td style="padding:20px 28px 4px">
    <p style="margin:0 0 10px;color:${C.fosse};font-size:18px;font-weight:700">${esc(d.title)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${row("Format", esc(d.formatLine))}
      ${row("Papier", esc(d.paper))}
      ${row("Quantité", esc(d.qty))}
      ${row("Livraison", "Offerte")}
    </table>
  </td></tr>
  <tr><td style="padding:8px 28px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${C.border}">
    <tr><td style="padding:14px 0;color:${C.muted};font-size:13px;letter-spacing:1px;text-transform:uppercase">Total payé</td>
    <td style="padding:14px 0;text-align:right;color:${C.fosse};font-size:22px;font-weight:700">${esc(formatPrice(d.total))}</td></tr>
  </table></td></tr>
  <tr><td style="padding:4px 28px 0">
    <div style="background:${C.ecume};border-radius:8px;padding:16px 18px">
      <p style="margin:0 0 6px;color:${C.muted};font-size:12px;letter-spacing:1px;text-transform:uppercase">Livraison à</p>
      <p style="margin:0;color:${C.fosse};font-size:14px;line-height:1.6">${d.addressLines.map(esc).join("<br>")}</p>
    </div>
  </td></tr>
  <tr><td style="padding:20px 28px 0;color:${C.fosse};font-size:14px;line-height:1.6">${esc(delivery)}</td></tr>
  <tr><td style="padding:16px 28px 28px;color:${C.fosse};font-size:14px;line-height:1.6">
    Une question ? Répondez simplement à cet e-mail.<br><br>
    <strong>${esc(LEGAL.ownerName)}</strong><br><span style="color:${C.muted}">${esc(LEGAL.brand)}</span>
  </td></tr>
  <tr><td style="background:${C.ecume};padding:16px 28px;color:${C.muted};font-size:12px;line-height:1.6;text-align:center">
    Droit de rétractation : 14 jours après réception — <a href="${esc(LEGAL.website)}/retractation" style="color:${C.vague}">formulaire</a> ·
    <a href="${esc(LEGAL.website)}/cgv" style="color:${C.vague}">CGV</a><br>${esc(LEGAL.vat)}
  </td></tr>
</table>
</td></tr></table>
</body></html>`

  return { subject, text, html }
}
