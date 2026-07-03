"use client"

import { useEffect, useRef, useState } from "react"
import { useIntro } from "@/context/IntroContext"

type Props = {
  videoUrl: string
  posterUrl?: string
  title?: string
  subtitle?: string
}

const NAV_HEIGHT = 64

export default function VideoIntro({ videoUrl, posterUrl, title, subtitle }: Props) {
  const { activate, collapse } = useIntro()
  const [expanded, setExpanded] = useState(true)
  const [transitioning, setTransitioning] = useState(false)
  const [done, setDone] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hasTriggered = useRef(false)

  // Tell Navigation we're active
  useEffect(() => {
    activate()
    return () => collapse()
  }, [activate, collapse])

  // Listen for scroll wheel & touch swipe up
  useEffect(() => {
    if (!expanded) return

    function onWheel(e: WheelEvent) {
      if (e.deltaY > 10) trigger()
    }

    let touchStartY = 0
    function onTouchStart(e: TouchEvent) {
      touchStartY = e.touches[0].clientY
    }
    function onTouchEnd(e: TouchEvent) {
      if (touchStartY - e.changedTouches[0].clientY > 40) trigger()
    }

    window.addEventListener("wheel", onWheel, { passive: true })
    window.addEventListener("touchstart", onTouchStart, { passive: true })
    window.addEventListener("touchend", onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchend", onTouchEnd)
    }
  }, [expanded])

  function trigger() {
    if (hasTriggered.current || !expanded) return
    hasTriggered.current = true
    setTransitioning(true)

    // After transition completes, mark as done and unlock scroll
    setTimeout(() => {
      setExpanded(false)
      setDone(true)
      collapse()
    }, 900)
  }

  // Lock body scroll while expanded
  useEffect(() => {
    if (expanded) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [expanded])

  // Once fully done, we can unmount (the nav takes over)
  if (done) return null

  const containerStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 60,
    overflow: "hidden",
    height: transitioning ? `${NAV_HEIGHT}px` : "100dvh",
    transition: transitioning
      ? "height 0.85s cubic-bezier(0.76,0,0.24,1)"
      : "none",
  }

  return (
    <div style={containerStyle}>
      {/* Video */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      {/* Dark overlay — fades out during collapse */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          opacity: transitioning ? 0 : 1,
          transition: "opacity 0.4s ease",
        }}
      />

      {/* Content — fades out during collapse */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          textAlign: "center",
          opacity: transitioning ? 0 : 1,
          transition: "opacity 0.3s ease",
          pointerEvents: transitioning ? "none" : "auto",
        }}
      >
        {/* Logo / brand mark */}
        <p
          style={{
            fontSize: "0.65rem",
            textTransform: "uppercase",
            letterSpacing: "0.4em",
            color: "rgba(200,169,110,0.9)",
            marginBottom: "2rem",
            fontWeight: 600,
          }}
        >
          Carlito Laf Visuel
        </p>

        {title && (
          <h1
            style={{
              fontSize: "clamp(2.5rem, 8vw, 7rem)",
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1,
              marginBottom: subtitle ? "1.5rem" : "3rem",
              textShadow: "0 4px 60px rgba(0,0,0,0.4)",
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </h1>
        )}

        {subtitle && (
          <p
            style={{
              fontSize: "clamp(0.9rem, 2vw, 1.2rem)",
              color: "rgba(240,237,232,0.75)",
              maxWidth: "36rem",
              lineHeight: 1.6,
              marginBottom: "3rem",
            }}
          >
            {subtitle}
          </p>
        )}

        {/* Scroll indicator */}
        <button
          onClick={trigger}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "rgba(255,255,255,0.5)",
            marginTop: "2rem",
          }}
        >
          <span
            style={{
              fontSize: "0.6rem",
              textTransform: "uppercase",
              letterSpacing: "0.3em",
            }}
          >
            Découvrir
          </span>
          <ScrollArrow />
        </button>
      </div>

      {/* Corner skip button */}
      {!transitioning && (
        <button
          onClick={trigger}
          style={{
            position: "absolute",
            bottom: "1.5rem",
            right: "1.5rem",
            fontSize: "0.6rem",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: "rgba(255,255,255,0.3)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.5rem",
          }}
        >
          Passer →
        </button>
      )}
    </div>
  )
}

function ScrollArrow() {
  return (
    <svg
      width="20"
      height="28"
      viewBox="0 0 20 28"
      fill="none"
      style={{ animation: "bounce 2s ease-in-out infinite" }}
    >
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
      `}</style>
      <rect x="9" y="0" width="2" height="18" rx="1" fill="rgba(200,169,110,0.7)" />
      <path d="M10 26 L3 18 L17 18 Z" fill="rgba(200,169,110,0.7)" />
    </svg>
  )
}
