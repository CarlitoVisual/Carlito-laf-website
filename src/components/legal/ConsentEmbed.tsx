"use client"

import { useState } from "react"
import Link from "next/link"

type Props = {
  /** URL de la vidéo YouTube ou Vimeo telle que saisie dans Sanity */
  url: string
  title?: string
  autoplay?: boolean
  className?: string
  style?: React.CSSProperties
}

type Embed = { provider: "YouTube" | "Vimeo"; src: string }

/** Construit l'URL du lecteur en mode « confidentialité renforcée ». */
export function toPrivacyEmbed(url: string, autoplay = true): Embed | null {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (yt) {
    const p = new URLSearchParams({ rel: "0" })
    if (autoplay) p.set("autoplay", "1")
    return { provider: "YouTube", src: `https://www.youtube-nocookie.com/embed/${yt[1]}?${p}` }
  }
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeo) {
    const p = new URLSearchParams({ dnt: "1", title: "0", byline: "0", portrait: "0" })
    if (autoplay) p.set("autoplay", "1")
    return { provider: "Vimeo", src: `https://player.vimeo.com/video/${vimeo[1]}?${p}` }
  }
  return null
}

/**
 * Lecteur vidéo tiers chargé uniquement après un clic de l'internaute :
 * aucune connexion à YouTube/Vimeo (ni cookie) tant qu'il n'a pas choisi de lire la vidéo.
 */
export default function ConsentEmbed({ url, title = "Vidéo", className, style }: Props) {
  const [play, setPlay] = useState(false)
  const embed = toPrivacyEmbed(url, true)
  if (!embed) return null

  if (play) {
    return (
      <iframe
        src={embed.src}
        title={title}
        className={className}
        style={{ border: "none", ...style }}
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
      />
    )
  }

  return (
    <div
      className={className}
      style={{
        ...style,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        padding: 24,
        textAlign: "center",
        background: "var(--gradient-depth)",
      }}
    >
      <button
        type="button"
        onClick={() => setPlay(true)}
        className="inline-flex items-center gap-3 min-h-12 px-7 rounded-full text-sm font-bold uppercase"
        style={{ background: "var(--color-accent)", color: "var(--color-on-accent)", letterSpacing: "0.1em" }}
      >
        <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true"><path d="M0 0l14 8-14 8z" fill="currentColor" /></svg>
        Lire la vidéo
      </button>
      <p style={{ color: "var(--color-muted)", fontSize: 12, maxWidth: 420, lineHeight: 1.5 }}>
        Vidéo hébergée par {embed.provider}. En la lançant, vous acceptez que {embed.provider} dépose des cookies.{" "}
        <Link href="/confidentialite#cookies" style={{ color: "var(--color-accent)", textDecoration: "underline" }}>En savoir plus</Link>
      </p>
    </div>
  )
}
