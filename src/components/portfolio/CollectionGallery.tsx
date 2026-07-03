"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"

export type GalleryPhoto = {
  _id: string
  title?: string
  alt?: string
  src: string
  srcFull: string
  width: number
  height: number
  location?: string
  availableAsPrint: boolean
  productSlug?: string
}

/* ─────────────────────────────── Lightbox ─────────────────────────────── */

function Lightbox({
  photos,
  index,
  onClose,
  onNav,
  onPrintRequest,
}: {
  photos: GalleryPhoto[]
  index: number
  onClose: () => void
  onNav: (i: number) => void
  onPrintRequest: (photo: GalleryPhoto) => void
}) {
  const photo = photos[index]
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") onNav((index + 1) % photos.length)
      if (e.key === "ArrowLeft") onNav((index - 1 + photos.length) % photos.length)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [index, photos.length, onClose, onNav])

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 50) onNav(dx < 0 ? (index + 1) % photos.length : (index - 1 + photos.length) % photos.length)
    touchStartX.current = null
  }

  return createPortal(
    <div
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.97)", display: "flex", flexDirection: "column" }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", flexShrink: 0 }}>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
          {index + 1} / {photos.length}
        </span>
        <button
          onClick={onClose}
          style={{ color: "#fff", background: "none", border: "none", fontSize: 28, cursor: "pointer", lineHeight: 1, padding: "0 4px" }}
          aria-label="Fermer"
        >
          ×
        </button>
      </div>

      {/* Image area */}
      <div style={{ flex: 1, position: "relative", minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Prev */}
        {photos.length > 1 && (
          <button
            onClick={() => onNav((index - 1 + photos.length) % photos.length)}
            style={{
              position: "absolute", left: 16, zIndex: 1,
              width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
              color: "#fff", fontSize: 22, cursor: "pointer", backdropFilter: "blur(4px)",
            }}
            aria-label="Précédente"
          >‹</button>
        )}

        {/* Image */}
        <div style={{ position: "relative", width: "100%", height: "100%", maxWidth: "90vw", maxHeight: "80vh" }}>
          <Image
            key={photo._id}
            src={photo.srcFull}
            alt={photo.alt ?? photo.title ?? ""}
            fill
            style={{ objectFit: "contain" }}
            sizes="90vw"
            priority
          />
        </div>

        {/* Next */}
        {photos.length > 1 && (
          <button
            onClick={() => onNav((index + 1) % photos.length)}
            style={{
              position: "absolute", right: 16, zIndex: 1,
              width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
              color: "#fff", fontSize: 22, cursor: "pointer", backdropFilter: "blur(4px)",
            }}
            aria-label="Suivante"
          >›</button>
        )}
      </div>

      {/* Bottom bar */}
      <div style={{ flexShrink: 0, padding: "20px 24px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          {photo.title && (
            <p style={{ color: "#fff", fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{photo.title}</p>
          )}
          {photo.location && (
            <p style={{ color: "var(--color-accent)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {photo.location}
            </p>
          )}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {photo.availableAsPrint ? (
            <a
              href={photo.productSlug ? `/boutique/${photo.productSlug}` : "/boutique"}
              style={{
                padding: "10px 22px", background: "var(--color-accent)", color: "#000",
                fontWeight: 700, fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase",
                textDecoration: "none", display: "inline-block",
              }}
            >
              Disponible en boutique →
            </a>
          ) : (
            <button
              onClick={() => onPrintRequest(photo)}
              style={{
                padding: "10px 22px", background: "transparent",
                border: "1px solid rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.8)",
                fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer",
              }}
            >
              Je veux ce tirage
            </button>
          )}
        </div>
      </div>

      {/* Dot strip */}
      {photos.length > 1 && photos.length <= 20 && (
        <div style={{ flexShrink: 0, display: "flex", justifyContent: "center", gap: 6, paddingBottom: 16 }}>
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => onNav(i)}
              style={{
                width: i === index ? 24 : 6, height: 6, borderRadius: 3, border: "none", padding: 0, cursor: "pointer",
                background: i === index ? "var(--color-accent)" : "rgba(255,255,255,0.25)",
                transition: "all 0.25s",
              }}
            />
          ))}
        </div>
      )}
    </div>,
    document.body
  )
}

/* ─────────────────────────── Print request modal ───────────────────────── */

function PrintRequestModal({ photo, onClose }: { photo: GalleryPhoto; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", message: "", company: "" })
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", fontSize: 14,
    background: "var(--color-bg)", border: "1px solid var(--color-border)",
    color: "var(--color-text)", outline: "none",
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("sending")
    try {
      const res = await fetch("/api/print-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoTitle: photo.title, photoId: photo._id, ...form }),
      })
      if (!res.ok) throw new Error()
      setStatus("sent")
    } catch {
      setStatus("error")
    }
  }

  return createPortal(
    <div
      style={{ position: "fixed", inset: 0, zIndex: 110, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", padding: 24 }}
      onClick={onClose}
    >
      <div
        style={{ width: "100%", maxWidth: 460, background: "var(--color-surface)", border: "1px solid var(--color-border)", padding: 36, position: "relative" }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "var(--color-muted)", fontSize: 22, cursor: "pointer" }}>×</button>

        {status === "sent" ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <p style={{ color: "var(--color-accent)", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Demande envoyée ✓</p>
            <p style={{ color: "var(--color-muted)", fontSize: 14 }}>
              Je vous contacterai dès que ce tirage sera disponible en boutique.
            </p>
          </div>
        ) : (
          <>
            <p style={{ color: "var(--color-accent)", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
              Demande de tirage
            </p>
            <h3 style={{ color: "var(--color-text)", fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
              {photo.title ?? "Cette photo"}
            </h3>
            <p style={{ color: "var(--color-muted)", fontSize: 13, marginBottom: 28 }}>
              Cette image n'est pas encore en boutique. Laissez vos coordonnées — je vous préviendrai quand elle sera disponible.
            </p>

            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="text"
                name="company"
                value={form.company}
                onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
              />
              <input name="name" required placeholder="Prénom Nom *" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
              <input name="email" type="email" required placeholder="Email *" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} />
              <textarea placeholder="Format souhaité, remarques..." rows={3} value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                style={{ ...inputStyle, resize: "vertical" }} />

              {status === "error" && (
                <p style={{ color: "#ef4444", fontSize: 12 }}>Erreur — contactez-moi : charleslaf.photo@gmail.com</p>
              )}
              <button type="submit" disabled={status === "sending"} style={{
                padding: "14px", background: "var(--color-accent)", color: "#000",
                fontWeight: 700, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase",
                border: "none", cursor: "pointer", opacity: status === "sending" ? 0.6 : 1,
              }}>
                {status === "sending" ? "Envoi…" : "Envoyer la demande"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  )
}

/* ──────────────────────────── Gallery grid ─────────────────────────────── */

export default function CollectionGallery({ photos }: { photos: GalleryPhoto[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [printTarget, setPrintTarget] = useState<GalleryPhoto | null>(null)

  const openLightbox = useCallback((i: number) => setLightboxIndex(i), [])
  const closeLightbox = useCallback(() => setLightboxIndex(null), [])

  const openPrintRequest = useCallback((photo: GalleryPhoto) => {
    setLightboxIndex(null)
    setPrintTarget(photo)
  }, [])

  if (photos.length === 0) {
    return (
      <div style={{ padding: "96px 0", textAlign: "center", color: "var(--color-muted)" }}>
        Aucune photo dans cette collection.
      </div>
    )
  }

  return (
    <>
      {/* Masonry grid */}
      <div style={{ columns: "3 260px", columnGap: 8 }}>
        {photos.map((photo, i) => (
          <div
            key={photo._id}
            onClick={() => openLightbox(i)}
            style={{
              breakInside: "avoid",
              marginBottom: 8,
              position: "relative",
              overflow: "hidden",
              background: "var(--color-surface)",
              cursor: "zoom-in",
            }}
            className="group"
          >
            <Image
              src={photo.src}
              alt={photo.alt ?? photo.title ?? ""}
              width={photo.width || 900}
              height={photo.height || 600}
              style={{ width: "100%", height: "auto", display: "block" }}
              sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
            />

            {/* Hover overlay */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 flex flex-col justify-between p-4"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)" }}
            >
              {/* Print badge */}
              {!photo.availableAsPrint && (
                <div style={{ alignSelf: "flex-end" }}>
                  <button
                    onClick={e => { e.stopPropagation(); openPrintRequest(photo) }}
                    style={{
                      padding: "5px 10px", fontSize: 10, fontWeight: 700,
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.3)",
                      color: "rgba(255,255,255,0.85)", cursor: "pointer", backdropFilter: "blur(4px)",
                    }}
                  >
                    Je veux ce tirage
                  </button>
                </div>
              )}
              {photo.availableAsPrint && (
                <div style={{ alignSelf: "flex-end" }}>
                  <span style={{
                    padding: "4px 8px", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                    textTransform: "uppercase", background: "var(--color-accent)", color: "#000",
                  }}>
                    En boutique
                  </span>
                </div>
              )}

              {/* Info */}
              <div>
                {photo.title && <p style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>{photo.title}</p>}
                {photo.location && <p style={{ color: "var(--color-accent)", fontSize: 11, marginTop: 2 }}>{photo.location}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          index={lightboxIndex}
          onClose={closeLightbox}
          onNav={setLightboxIndex}
          onPrintRequest={openPrintRequest}
        />
      )}

      {/* Print request modal */}
      {printTarget && (
        <PrintRequestModal photo={printTarget} onClose={() => setPrintTarget(null)} />
      )}
    </>
  )
}
