import type { Product } from "@/types/sanity"

/** "Ocean Collection 2022" → "ocean-collection-2022" */
export function slugifyCollection(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

/** Reverse: find collection name from slug among known collections */
export function matchCollection(slug: string, collections: string[]): string | undefined {
  return collections.find((c) => slugifyCollection(c) === slug)
}

export function formatPrice(price: number, currency = "EUR"): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(price)
}

export function isFormatAvailable(format: { stock?: number }): boolean {
  return (format.stock ?? 1) > 0
}

export function startingPrice(product: Pick<Product, "formats" | "price">): number | null {
  if (product.formats?.length) {
    const prices = product.formats
      .filter((f) => isFormatAvailable(f) && f.price)
      .map((f) => f.price as number)
    if (prices.length) return Math.min(...prices)
  }
  return product.price ?? null
}

export function isProductAvailable(product: Pick<Product, "formats">): boolean {
  if (!product.formats?.length) return true
  return product.formats.some((f) => isFormatAvailable(f))
}

/** Papiers FineArt (valeurs du champ produit « paper » dans le Studio). */
export const PAPER_LABELS: Record<string, string> = {
  "photo-rag": "Hahnemühle Photo Rag®",
  baryta: "Hahnemühle Baryta",
  "museum-etching": "Hahnemühle Museum Etching",
  bamboo: "Hahnemühle Bamboo",
  hemp: "Hahnemühle Hemp",
}

export const paperLabel = (v: string | undefined) => (v ? PAPER_LABELS[v] ?? v : "Papier FineArt Hahnemühle")

/* ── Gammes de tirage ───────────────────────────────────────────── */

export type PrintRange = "fineart" | "photo"
export const rangeOf = (r: string | undefined): PrintRange => (r === "photo" ? "photo" : "fineart")

export const RANGE_INFO: Record<PrintRange, { label: string; detail: string }> = {
  fineart: { label: "Fine Art", detail: "Papier d’art Hahnemühle, rendu musée" },
  photo: { label: "Papier photo", detail: "Mat ou brillant, à petit prix" },
}

export const FINISHES = [
  { value: "mat", label: "Mat" },
  { value: "brillant", label: "Brillant" },
] as const
export type Finish = (typeof FINISHES)[number]["value"]
export const isFinish = (v: unknown): v is Finish => v === "mat" || v === "brillant"

/** Papier affiché au client (commande, e-mails) selon la gamme. */
export function printPaperLabel(range: string | undefined, finish: string | undefined, paper: string | undefined): string {
  return rangeOf(range) === "photo" ? `Papier photo ${finish === "brillant" ? "brillant" : "mat"}` : paperLabel(paper)
}

/** Tailles proposées (une seule fois chacune, toutes gammes confondues), pour les vignettes. */
export function sizeChips(formats: { name: string; stock?: number }[] | undefined): { name: string; available: boolean }[] {
  const map = new Map<string, boolean>()
  for (const f of formats ?? []) map.set(f.name, (map.get(f.name) ?? false) || isFormatAvailable(f))
  return [...map].map(([name, available]) => ({ name, available }))
}

export const hasBothRanges = (formats: { range?: string }[] | undefined) =>
  new Set((formats ?? []).map((f) => rangeOf(f.range))).size > 1
