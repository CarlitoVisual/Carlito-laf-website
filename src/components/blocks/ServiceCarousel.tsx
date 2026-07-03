"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { urlFor } from "@/lib/image"

type Service = {
  _id: string
  title: string
  slug?: string
  shortDescription?: string
  coverImage?: any
  category?: string
  priceType?: string
  price?: number
  currency?: string
}

type Props = {
  services: Service[]
  buttonLabel?: string
}

export default function ServiceCarousel({ services, buttonLabel = "Découvrir" }: Props) {
  const [active, setActive] = useState(0)
  const [animating, setAnimating] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const goTo = useCallback((index: number) => {
    if (animating || index === active) return
    setAnimating(true)
    setTimeout(() => {
      setActive(index)
      setAnimating(false)
    }, 400)
  }, [animating, active])

  const prev = () => goTo((active - 1 + services.length) % services.length)
  const next = () => goTo((active + 1) % services.length)

  // Auto-advance
  useEffect(() => {
    timerRef.current = setTimeout(next, 5000)
    return () => clearTimeout(timerRef.current)
  }, [active])

  const service = services[active]

  return (
    <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
      {/* Background image */}
      <div
        style={{
          position: "relative",
          height: "90vh",
          minHeight: 500,
          transition: "opacity 0.4s ease",
          opacity: animating ? 0 : 1,
        }}
      >
        {service.coverImage ? (
          <Image
            src={urlFor(service.coverImage).width(1600).quality(88).url()}
            alt={service.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "var(--color-surface)" }} />
        )}

        {/* Dark gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 40%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 8vw",
            maxWidth: 720,
          }}
        >
          {service.category && (
            <p style={{
              color: "var(--color-accent)",
              fontSize: "0.7rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}>
              {service.category}
            </p>
          )}

          <h3
            style={{
              color: "#fff",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: 20,
            }}
          >
            {service.title}
          </h3>

          {service.shortDescription && (
            <p style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: "1rem",
              lineHeight: 1.7,
              maxWidth: 480,
              marginBottom: 36,
            }}>
              {service.shortDescription}
            </p>
          )}

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
            {service.slug ? (
              <Link
                href={`/prestations/${service.slug}`}
                style={{
                  display: "inline-block",
                  padding: "14px 32px",
                  background: "var(--color-accent)",
                  color: "#000",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                }}
              >
                {buttonLabel} →
              </Link>
            ) : null}
            <Link
              href="/devis"
              style={{
                display: "inline-block",
                padding: "13px 28px",
                border: "1px solid rgba(255,255,255,0.4)",
                color: "rgba(255,255,255,0.8)",
                fontWeight: 500,
                fontSize: "0.78rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              Demander un devis
            </Link>
          </div>
        </div>

        {/* Arrows */}
        <button
          onClick={prev}
          aria-label="Précédent"
          style={{
            position: "absolute",
            left: 24,
            top: "50%",
            transform: "translateY(-50%)",
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff",
            fontSize: "1.2rem",
            cursor: "pointer",
            backdropFilter: "blur(4px)",
          }}
        >
          ‹
        </button>
        <button
          onClick={next}
          aria-label="Suivant"
          style={{
            position: "absolute",
            right: 24,
            top: "50%",
            transform: "translateY(-50%)",
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff",
            fontSize: "1.2rem",
            cursor: "pointer",
            backdropFilter: "blur(4px)",
          }}
        >
          ›
        </button>

        {/* Dots + service thumbnails */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: "8vw",
            right: "8vw",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          {/* Progress bar */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {services.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Aller à ${services[i].title}`}
                style={{
                  height: 2,
                  width: i === active ? 40 : 20,
                  background: i === active ? "var(--color-accent)" : "rgba(255,255,255,0.35)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  padding: 0,
                }}
              />
            ))}
          </div>

          {/* Counter */}
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", marginLeft: 8 }}>
            {String(active + 1).padStart(2, "0")} / {String(services.length).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Thumbnail strip below */}
      <div
        style={{
          display: "flex",
          background: "var(--color-bg)",
          borderTop: "1px solid var(--color-border)",
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {services.map((s, i) => (
          <button
            key={s._id}
            onClick={() => goTo(i)}
            style={{
              flexShrink: 0,
              flexGrow: 1,
              position: "relative",
              height: 80,
              minWidth: 160,
              border: "none",
              borderBottom: `2px solid ${i === active ? "var(--color-accent)" : "transparent"}`,
              cursor: "pointer",
              overflow: "hidden",
              background: "var(--color-surface)",
              transition: "border-color 0.2s",
            }}
          >
            {s.coverImage && (
              <Image
                src={urlFor(s.coverImage).width(320).height(160).quality(70).url()}
                alt={s.title}
                fill
                className="object-cover"
                sizes="160px"
                style={{ opacity: i === active ? 1 : 0.45, transition: "opacity 0.2s" }}
              />
            )}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 12px",
              }}
            >
              <p style={{
                color: i === active ? "var(--color-accent)" : "rgba(255,255,255,0.7)",
                fontSize: "0.7rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                textAlign: "center",
                lineHeight: 1.3,
                transition: "color 0.2s",
              }}>
                {s.title}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
