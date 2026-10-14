/**
 * Pré-chiffrage automatique d'une demande de devis à partir de la grille tarifaire (document Sanity « priceGrid »).
 * Le résultat est un BROUILLON : Carlito le relit et l'ajuste dans le Studio avant tout envoi au client.
 */

export type DurationKey = "1h" | "2h" | "half" | "day" | "week"
export type ServiceKey = "photo" | "video" | "drone" | "actionCam" | "clipSocial" | "filmCourt" | "filmAventure" | "retoucheAvancee"
export type Usage = "private" | "commercial"

export const DURATION_KEYS: DurationKey[] = ["1h", "2h", "half", "day", "week"]
export const SERVICE_KEYS: ServiceKey[] = ["photo", "video", "drone", "actionCam", "clipSocial", "filmCourt", "filmAventure", "retoucheAvancee"]

export const SERVICE_LABELS: Record<ServiceKey, string> = {
  photo: "Photographie (longue focale)",
  video: "Vidéo",
  drone: "Drone (photo / vidéo)",
  actionCam: "Caméra d’action / prises dans l’eau",
  clipSocial: "Clip réseaux sociaux (≤ 60 s)",
  filmCourt: "Film court (1 à 3 min)",
  filmAventure: "Film aventure / récit (5 à 10 min)",
  retoucheAvancee: "Retouches avancées",
}

export type PriceGrid = {
  durations?: { key: DurationKey; label: string; price: number; includedRetouches?: number; optionTier?: "short" | "half" | "day" | "week" }[]
  comboPct?: number
  commercialPct?: number
  options?: { key: "drone" | "actionCam"; label: string; short?: number; half?: number; day?: number }[]
  retoucheStandard?: number
  retoucheAvancee?: number
  clipSocial?: number
  filmCourt?: number
  filmAventure?: number
  expressPct?: number
  freeKm?: number
  consumption?: number
  dieselPrice?: number
  wearPerKm?: number
  nightFlat?: number
  nightThresholdKm?: number
  validityDays?: number
  paymentTerms?: string
}

export type QuoteRequest = {
  duration: DurationKey
  services: ServiceKey[]
  usage: Usage
  express: boolean
  /** Distance aller depuis Bidart, en km (null si inconnue) */
  distanceKm: number | null
}

export type QuoteLine = { _key: string; _type: "line"; label: string; detail?: string; qty: number; unitPrice: number }

export type QuoteDraft = {
  lines: QuoteLine[]
  total: number
  includedRetouches: number
  warnings: string[]
}

const round2 = (n: number) => Math.round(n * 100) / 100
let keySeq = 0
const line = (label: string, unitPrice: number, qty = 1, detail?: string): QuoteLine => ({
  _key: `l${Date.now().toString(36)}${(keySeq++).toString(36)}`,
  _type: "line",
  label,
  detail,
  qty,
  unitPrice: round2(unitPrice),
})

export function computeQuote(grid: PriceGrid, req: QuoteRequest): QuoteDraft {
  const lines: QuoteLine[] = []
  const warnings: string[] = []
  const dur = grid.durations?.find((d) => d.key === req.duration)
  if (!dur) {
    warnings.push("Durée introuvable dans la grille tarifaire : chiffrage de la prise de vue à compléter.")
  }
  const tier = dur?.optionTier ?? "day"
  const has = (k: ServiceKey) => req.services.includes(k)

  // ── Prise de vue ──
  let shooting = 0
  if (dur) {
    const photo = has("photo")
    const video = has("video")
    const what = photo && video ? "photo + vidéo" : video ? "vidéo" : "photo"
    let base = dur.price
    if (photo && video) base = dur.price * (1 + (grid.comboPct ?? 50) / 100)
    lines.push(line(`Prise de vue ${what} — ${dur.label}`, base, 1, photo ? `Sélection et retouche standard de ${dur.includedRetouches ?? 0} photos incluses` : undefined))
    shooting += base
  }

  // ── Options techniques ──
  for (const key of ["drone", "actionCam"] as const) {
    if (!has(key)) continue
    const opt = grid.options?.find((o) => o.key === key)
    if (!opt) continue
    const price = tier === "week" ? (opt.day ?? 0) * 5 : tier === "short" ? opt.short ?? 0 : tier === "half" ? opt.half ?? 0 : opt.day ?? 0
    lines.push(line(opt.label, price, 1, tier === "week" ? "5 jours" : undefined))
    shooting += price
  }
  if (has("drone")) warnings.push("Drone : vérifier les zones de vol et autorisations (Géoportail / AlphaTango) pour le lieu indiqué.")

  // ── Usage commercial ──
  if (req.usage === "commercial" && shooting > 0) {
    const pct = grid.commercialPct ?? 40
    lines.push(line(`Licence d’utilisation commerciale (+${pct} %)`, (shooting * pct) / 100, 1, "Usages, supports et durée à préciser"))
  }

  // ── Post-production ──
  let post = 0
  const postItems: [ServiceKey, number | undefined, string][] = [
    ["clipSocial", grid.clipSocial, "Montage — clip réseaux sociaux (≤ 60 s, vertical)"],
    ["filmCourt", grid.filmCourt, "Montage — film court (1 à 3 min)"],
    ["filmAventure", grid.filmAventure, "Montage — film aventure / récit (5 à 10 min), à partir de"],
  ]
  for (const [k, price, label] of postItems) {
    if (has(k) && price) {
      lines.push(line(label, price))
      post += price
    }
  }
  if (has("retoucheAvancee")) {
    warnings.push("Retouches avancées demandées : nombre de photos à confirmer (ligne à 0 par défaut).")
    lines.push(line("Retouches avancées (compositing, nettoyage, grade créatif)", grid.retoucheAvancee ?? 12, 0, "Quantité à définir"))
  }
  if (req.express && post > 0) {
    const pct = grid.expressPct ?? 30
    lines.push(line(`Livraison express < 72 h (+${pct} % de la post-production)`, (post * pct) / 100))
  }

  // ── Déplacement ──
  if (req.distanceKm == null) {
    warnings.push("Lieu non localisé automatiquement : frais de déplacement à calculer.")
  } else {
    const roundTrip = req.distanceKm * 2
    const billed = Math.max(0, Math.round(roundTrip - (grid.freeKm ?? 30)))
    if (billed > 0) {
      const perKm = ((grid.consumption ?? 6) / 100) * (grid.dieselPrice ?? 2.345) + (grid.wearPerKm ?? 0.1)
      lines.push(line("Frais de déplacement", perKm, billed, `${billed} km facturés (aller-retour ≈ ${Math.round(roundTrip)} km, ${grid.freeKm ?? 30} km inclus) à ${perKm.toFixed(3)} €/km`))
    }
    if (req.duration === "week" && req.distanceKm >= (grid.nightThresholdKm ?? 50)) {
      lines.push(line("Hébergement et repas (forfait par nuit)", grid.nightFlat ?? 90, 4))
    }
  }

  const total = round2(lines.reduce((s, l) => s + l.qty * l.unitPrice, 0))
  return { lines, total, includedRetouches: dur?.includedRetouches ?? 0, warnings }
}

/** Montant formaté en euros (fr-FR). */
export const euro = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n)
