"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { safeHref } from "@/lib/safe"

export type LineUpPanel = {
  key: string
  title: string
  href?: string
  imageUrl?: string
  meta?: string
  description?: string
  cta?: string
  /** Bouton secondaire affiché quand le panneau est ouvert (ex. essai virtuel pour la boutique) */
  secondary?: { label: string; href: string }
}

type Props = {
  eyebrow?: string
  title?: string
  panels: LineUpPanel[]
}

/**
 * « Line-up » : panneaux plein-hauteur, celui survolé (ou touché sur mobile) s'ouvre en grand.
 * Desktop : rangée horizontale. Mobile : accordéon vertical.
 */
export default function LineUp({ eyebrow, title, panels }: Props) {
  const [active, setActive] = useState(0)
  // Sur écran tactile, le navigateur émule survol + focus juste avant le clic :
  // on mémorise donc l'état du panneau au moment où le doigt touche l'écran.
  const touchedWhileClosed = useRef(false)

  return (
    <section className="px-6 pt-24 pb-16">
      <div className="max-w-7xl mx-auto">
        {(eyebrow || title) && (
          <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
            <div>
              {eyebrow && (
                <p className="font-mono-data text-xs uppercase mb-3" style={{ color: "var(--color-data)", letterSpacing: "0.18em" }}>
                  {eyebrow}
                </p>
              )}
              {title && (
                <h2 className="text-5xl md:text-7xl" style={{ color: "var(--color-text)" }}>
                  {title}
                </h2>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-2.5 h-[640px] md:h-[620px]">
          {panels.map((p, i) => {
            const open = i === active
            const num = String(i + 1).padStart(2, "0")
            return (
              <div
                key={p.key}
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") setActive(i)
                }}
                className="group relative overflow-hidden rounded-lg min-w-0 min-h-[64px]"
                style={{
                  flex: open ? "5 1 0px" : "1 1 0px",
                  transition: "flex-grow 500ms ease",
                  background: "var(--gradient-depth)",
                }}
              >
                {p.imageUrl && (
                  <Image
                    src={p.imageUrl}
                    alt=""
                    fill
                    sizes="(max-width:768px) 100vw, 70vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    priority={i === 0}
                  />
                )}
                {/* Voile bleu « profondeur » : plus dense sur les panneaux fermés */}
                <div
                  className="absolute inset-0 transition-opacity duration-500"
                  style={{
                    background: "linear-gradient(180deg, rgba(19,96,147,0.45) 0%, rgba(5,27,46,0.85) 100%)",
                    opacity: open ? 0 : 1,
                  }}
                />

                {/* Lien principal étiré sur tout le panneau (évite les liens imbriqués) */}
                <Link
                href={safeHref(p.href)}
                aria-label={p.title}
                onPointerDown={(e) => {
                  touchedWhileClosed.current = e.pointerType !== "mouse" && !open
                }}
                onFocus={(e) => {
                  // Focus clavier (Tab) : ouvrir le panneau. Le focus provoqué par un toucher est ignoré.
                  if (e.currentTarget.matches(":focus-visible")) setActive(i)
                }}
                onClick={(e) => {
                  // Écran tactile : premier appui = déplier le panneau, second appui = ouvrir la page
                  if (touchedWhileClosed.current || !open) {
                    e.preventDefault()
                    touchedWhileClosed.current = false
                    setActive(i)
                  }
                }}
                aria-expanded={open}
                className="absolute inset-0 z-[1] rounded-lg"
              />

                {open ? (
                  <div
                    className="absolute left-0 right-0 bottom-0 z-[2] pointer-events-none p-5 md:p-8 flex flex-wrap items-end justify-between gap-5"
                    style={{ background: "rgba(5,27,46,0.88)" }}
                  >
                    <div className="flex flex-col gap-2 max-w-xl">
                      <p className="font-mono-data text-xs uppercase" style={{ color: "var(--color-data)", letterSpacing: "0.16em" }}>
                        {num}{p.meta ? ` · ${p.meta}` : ""}
                      </p>
                      <h3 className="text-5xl md:text-7xl uppercase font-black" style={{ color: "var(--color-text)" }}>
                        {p.title}
                      </h3>
                      {p.description && (
                        <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--color-muted)" }}>
                          {p.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {p.secondary && (
                        <Link
                          href={safeHref(p.secondary.href)}
                          className="pointer-events-auto inline-flex items-center gap-2 min-h-12 px-6 rounded-full text-xs font-bold uppercase border transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-on-accent)]"
                          style={{ borderColor: "var(--color-accent)", color: "var(--color-accent)", letterSpacing: "0.12em" }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5V21H3z" /><rect x="8" y="10" width="8" height="6" /></svg>
                          {p.secondary.label}
                        </Link>
                      )}
                      <span
                        className="inline-flex items-center min-h-12 px-6 rounded-full text-xs font-bold uppercase"
                        style={{ background: "var(--color-accent)", color: "var(--color-on-accent)", letterSpacing: "0.12em" }}
                      >
                        {p.cta || "Découvrir"} →
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 z-[2] pointer-events-none flex md:flex-col items-center justify-between px-5 md:px-0 md:py-6">
                    <span
                      className="font-display uppercase font-extrabold text-2xl md:text-4xl md:[writing-mode:vertical-rl] md:rotate-180 order-1 md:order-2"
                      style={{ color: "var(--color-text)", letterSpacing: "0.06em" }}
                    >
                      {p.title}
                    </span>
                    <span className="font-mono-data text-xs order-2 md:order-1" style={{ color: "var(--color-data)" }}>
                      {num}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
