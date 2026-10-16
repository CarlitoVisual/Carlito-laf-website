"use client"

/**
 * Chargeur next/image global (next.config.ts → images.loaderFile).
 * Les images Sanity sont redimensionnées directement par le CDN Sanity à chaque largeur du srcset
 * (au lieu d'agrandir puis recompresser une image déjà réduite) : vignettes nettes sur écran Retina,
 * format moderne (WebP/AVIF) servi automatiquement. Un rapport largeur/hauteur demandé (w + h, recadrage
 * au point d'intérêt) est conservé.
 */
export default function sanityImageLoader({ src, width, quality }: { src: string; width: number; quality?: number }): string {
  if (!src.startsWith("https://cdn.sanity.io/")) return src
  const url = new URL(src)
  const w0 = Number(url.searchParams.get("w"))
  const h0 = Number(url.searchParams.get("h"))
  url.searchParams.set("w", String(width))
  if (w0 && h0) url.searchParams.set("h", String(Math.round((width * h0) / w0)))
  else url.searchParams.delete("h")
  url.searchParams.set("q", String(quality ?? (Number(url.searchParams.get("q")) || 82)))
  url.searchParams.set("auto", "format")
  if (!url.searchParams.has("fit")) url.searchParams.set("fit", "max")
  return url.toString()
}
