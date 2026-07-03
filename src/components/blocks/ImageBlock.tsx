"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { urlFor } from "@/lib/image"

const sizeMap: Record<string, string> = {
  small:      "max-w-xl",
  medium:     "max-w-3xl",
  large:      "max-w-5xl",
  fullscreen: "max-w-none px-0",
}

const aspectMap: Record<string, string> = {
  "auto":    "",
  "16-9":    "56.25%",
  "4-3":     "75%",
  "square":  "100%",
  "portrait":"133.33%",
}

export default function ImageBlock(props: any) {
  const {
    image, caption, credit,
    size = "large", aspectRatio = "auto",
    display = "normal", overlay = false, overlayText,
    link,
  } = props

  const [zoomed, setZoomed] = useState(false)

  if (!image) return null

  const imgUrl = urlFor(image).width(display === "fullscreen" ? 2400 : 1600).quality(90).url()
  const paddingBottom = aspectMap[aspectRatio]
  const isFullscreen = size === "fullscreen"
  const hasParallax = display === "parallax"
  const hasZoom = display === "zoom"

  const imgEl = (
    <div
      className={`relative overflow-hidden ${hasZoom ? "cursor-zoom-in group" : ""}`}
      style={
        paddingBottom
          ? { paddingBottom, position: "relative" }
          : { position: "relative", minHeight: isFullscreen ? "70vh" : 400 }
      }
      onClick={hasZoom ? () => setZoomed(true) : undefined}
    >
      <Image
        src={imgUrl}
        alt={caption || credit || ""}
        fill
        sizes={isFullscreen ? "100vw" : "(max-width:768px) 100vw, 80vw"}
        className={`object-cover transition-transform duration-700 ${hasZoom ? "group-hover:scale-105" : ""}`}
        style={hasParallax ? { objectPosition: "center center" } : undefined}
      />

      {/* Dark overlay + text */}
      {overlay && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.45)" }}
        >
          {overlayText && (
            <p className="text-white text-2xl font-bold text-center px-6">
              {overlayText}
            </p>
          )}
        </div>
      )}
    </div>
  )

  const content = link?.href || link?.internalReference ? (
    <Link href={link.href || "#"} target={link.openInNewTab ? "_blank" : undefined}>
      {imgEl}
    </Link>
  ) : imgEl

  return (
    <section className={`py-10 ${isFullscreen ? "" : "px-6"}`}>
      <div className={`mx-auto ${sizeMap[size] || sizeMap.large}`}>
        {content}

        {(caption || credit) && (
          <div className="flex justify-between items-start mt-3 px-1">
            {caption && (
              <p className="text-sm italic" style={{ color: "var(--color-muted)" }}>
                {caption}
              </p>
            )}
            {credit && (
              <p className="text-xs ml-4 flex-shrink-0" style={{ color: "var(--color-border)" }}>
                {credit}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Fullscreen zoom lightbox */}
      {zoomed && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.95)" }}
          onClick={() => setZoomed(false)}
        >
          <div className="relative w-full h-full max-w-6xl">
            <Image src={imgUrl} alt={caption || ""} fill className="object-contain" />
            <button
              className="absolute top-2 right-2 w-10 h-10 flex items-center justify-center text-2xl"
              style={{ color: "var(--color-muted)" }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
