import AmbientVideo from "@/components/AmbientVideo"
import { urlFor } from "@/lib/image"
import type { PageBackgroundVideo } from "@/types/sanity"

/** Voile plus marqué qu'en section : le texte des blocs est posé directement sur la vidéo. */
const PAGE_OVERLAY_ALPHA: Record<string, number> = { none: 0.35, light: 0.55, medium: 0.7, strong: 0.82 }

type Props = {
  backgroundVideo?: PageBackgroundVideo
  children: React.ReactNode
}

/**
 * Enveloppe de page : si une « Vidéo de fond de page » est renseignée dans Sanity,
 * elle est fixée derrière le contenu et les fonds des sections deviennent transparents (voir globals.css).
 */
export default function PageShell({ backgroundVideo, children }: Props) {
  const src = backgroundVideo?.file?.asset?.url
  if (!src) return <>{children}</>

  const poster = backgroundVideo?.poster?.asset
    ? urlFor(backgroundVideo.poster).width(1920).quality(70).auto("format").url()
    : undefined
  const alpha = PAGE_OVERLAY_ALPHA[backgroundVideo?.overlay ?? "strong"] ?? 0.82

  return (
    <>
      {/* z-index négatif : sous le contenu de la page et sous le pied de page (qui a son propre fond) */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -1 }} aria-hidden="true">
        <AmbientVideo src={src} poster={poster} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: `rgba(5,27,46,${alpha})` }} />
      </div>
      <div className="ambient-page">{children}</div>
    </>
  )
}
