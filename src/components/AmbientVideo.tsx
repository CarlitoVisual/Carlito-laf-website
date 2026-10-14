"use client"

import { useEffect, useRef } from "react"

type Props = {
  src: string
  poster?: string
  className?: string
  style?: React.CSSProperties
}

/**
 * Vidéo décorative : boucle, sans son, sans contrôles.
 * - forcée en muet côté navigateur (sinon la lecture auto est bloquée sur iOS/Chrome) ;
 * - mise en pause hors écran pour économiser batterie et données ;
 * - pas de lecture si le visiteur a demandé de réduire les animations (l'image de remplacement reste affichée).
 */
export default function AmbientVideo({ src, poster, className, style }: Props) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    video.muted = true
    video.defaultMuted = true

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
    let visible = true
    const sync = () => {
      if (visible && !reduce.matches) video.play().catch(() => {})
      else video.pause()
    }

    // Une vidéo « fixe » est toujours dans l'écran : on observe donc sa section
    const target = video.closest("section") ?? video
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        sync()
      },
      { rootMargin: "200px 0px" }
    )
    io.observe(target)
    reduce.addEventListener("change", sync)
    sync()

    return () => {
      io.disconnect()
      reduce.removeEventListener("change", sync)
    }
  }, [src])

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      disablePictureInPicture
      aria-hidden="true"
      tabIndex={-1}
      className={className}
      style={style}
    />
  )
}
