import Link from "next/link"

function getEmbedUrl(url: string, autoplay = false) {
  if (!url) return null
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (ytMatch) {
    const params = new URLSearchParams({ rel: "0" })
    if (autoplay) params.set("autoplay", "1")
    return `https://www.youtube.com/embed/${ytMatch[1]}?${params}`
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) {
    const params = new URLSearchParams({ dnt: "1" })
    if (autoplay) params.set("autoplay", "1")
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?${params}`
  }
  return null
}

export default function VideoBlock(props: any) {
  const {
    title, url, file, videoType,
    display = "standard",
    autoplay = false, loop = false, muted = true, controls = true,
    overlay = false, overlayTitle, overlayText,
    button, caption,
  } = props

  const embedUrl = getEmbedUrl(url, autoplay)
  const isImmersive = display === "immersive" || display === "fullscreen" || display === "background"
  const fileUrl = file?.asset?.url

  return (
    <section
      className="relative"
      style={{
        background: isImmersive ? "#000" : "var(--color-surface)",
        paddingTop: isImmersive ? 0 : undefined,
        paddingBottom: isImmersive ? 0 : undefined,
      }}
    >
      {!isImmersive && title && (
        <div className="max-w-5xl mx-auto px-6 pt-20 pb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center" style={{ color: "var(--color-text)" }}>
            {title}
          </h2>
        </div>
      )}

      {/* Video container */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          paddingBottom: isImmersive ? "56.25vh" : "56.25%",
          maxHeight: isImmersive ? "90vh" : undefined,
        }}
      >
        {embedUrl ? (
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title || "Vidéo"}
          />
        ) : fileUrl ? (
          <video
            src={fileUrl}
            autoPlay={autoplay}
            loop={loop}
            muted={muted}
            controls={controls}
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : null}

        {/* Overlay text */}
        {overlay && (overlayTitle || overlayText) && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
            style={{ background: "rgba(0,0,0,0.45)" }}
          >
            {isImmersive && title && (
              <p className="text-xs uppercase font-semibold mb-4" style={{ color: "var(--color-accent)", letterSpacing: "0.3em" }}>
                {title}
              </p>
            )}
            {overlayTitle && (
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                {overlayTitle}
              </h2>
            )}
            {overlayText && (
              <p className="text-lg max-w-xl" style={{ color: "rgba(240,237,232,0.8)" }}>
                {overlayText}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Caption + button below */}
      {(caption || button?.label) && (
        <div
          className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: isImmersive ? "none" : "1px solid var(--color-border)" }}
        >
          {caption && (
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>{caption}</p>
          )}
          {button?.label && (
            <Link
              href={button.link?.href || button.url || "/contact"}
              className="text-sm uppercase px-6 py-3 font-semibold flex-shrink-0"
              style={{
                background: button.style === "outline" ? "transparent" : "var(--color-accent)",
                color: button.style === "outline" ? "var(--color-accent)" : "#000",
                border: button.style === "outline" ? "1px solid var(--color-accent)" : "none",
                letterSpacing: "0.15em",
              }}
            >
              {button.label}
            </Link>
          )}
        </div>
      )}
    </section>
  )
}
