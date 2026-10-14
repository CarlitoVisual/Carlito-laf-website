/**
 * Convertit un nom de format (« 40x60 », « 60 × 90 cm ») en dimensions réelles (cm),
 * orientées comme la photo (paysage / portrait).
 */
export function printSizeCm(formatName: string | undefined, imageAspect: number): { w: number; h: number } | null {
  if (!formatName) return null
  const m = formatName.match(/(\d+(?:[.,]\d+)?)\s*[x×*]\s*(\d+(?:[.,]\d+)?)/i)
  if (!m) return null
  const a = parseFloat(m[1].replace(",", "."))
  const b = parseFloat(m[2].replace(",", "."))
  const long = Math.max(a, b)
  const short = Math.min(a, b)
  if (Math.abs(imageAspect - 1) < 0.05) return { w: a, h: b }
  return imageAspect > 1 ? { w: long, h: short } : { w: short, h: long }
}

/** Lit les dimensions d'une image Sanity depuis la référence de son asset (« image-<id>-4000x6000-jpg »). */
export function sanityImageAspect(ref: string | undefined): number {
  const m = ref?.match(/-(\d+)x(\d+)-/)
  return m ? parseInt(m[1]) / parseInt(m[2]) : 1.5
}
