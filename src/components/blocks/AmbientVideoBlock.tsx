import AmbientVideo from "@/components/AmbientVideo"
import { urlFor } from "@/lib/image"
import type { BlockProps, AmbientVideoBlock as AmbientVideoBlockData } from "@/types/sanity"

const HEIGHT: Record<string, { height: string; minHeight: string }> = {
  screen: { height: "100svh", minHeight: "480px" },
  large: { height: "75svh", minHeight: "420px" },
  medium: { height: "55svh", minHeight: "320px" },
  band: { height: "35svh", minHeight: "220px" },
}

/** Opacité du voile « Fosse » posé sur la vidéo. */
export const OVERLAY_ALPHA: Record<string, number> = { none: 0, light: 0.25, medium: 0.45, strong: 0.65 }

export default function AmbientVideoBlock(props: BlockProps<AmbientVideoBlockData>) {
  const { video, poster, height = "large", fixed = false, overlay = "light", title, text } = props
  const src = video?.asset?.url
  const posterUrl = poster?.asset ? urlFor(poster).width(1920).quality(75).auto("format").url() : undefined
  if (!src && !posterUrl) return null

  const alpha = OVERLAY_ALPHA[overlay] ?? 0.25

  return (
    <section
      className="relative overflow-hidden"
      style={{
        ...(HEIGHT[height] ?? HEIGHT.large),
        background: "var(--color-bg)",
        // « Effet fenêtre » : la vidéo est fixe à l'écran mais découpée aux limites de la section
        clipPath: fixed ? "inset(0)" : undefined,
      }}
    >
      <div className={fixed ? "fixed inset-0" : "absolute inset-0"} aria-hidden="true">
        {src ? (
          <AmbientVideo src={src} poster={posterUrl} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${posterUrl})` }}
          />
        )}
        {alpha > 0 && (
          <div className="absolute inset-0" style={{ background: `rgba(5,27,46,${alpha})` }} />
        )}
      </div>

      {(title || text) && (
        <div className="relative z-[1] h-full flex flex-col items-center justify-center text-center px-6">
          {title && (
            <h2 className="text-4xl md:text-6xl mb-4" style={{ color: "var(--color-text)" }}>
              {title}
            </h2>
          )}
          {text && (
            <p className="text-lg max-w-xl" style={{ color: "rgba(244,239,230,0.85)" }}>
              {text}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
