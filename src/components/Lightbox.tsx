"use client"

import Image from "next/image"
import { useEffect } from "react"
import { urlFor } from "@/lib/image"

export default function Lightbox({ item, onClose }: any) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12"
      style={{ background: "rgba(0,0,0,0.95)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full h-full max-w-6xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={urlFor(item.image).width(2000).quality(95).url()}
          alt={item.alt || ""}
          fill
          className="object-contain"
        />

        <button
          onClick={onClose}
          className="absolute top-0 right-0 w-10 h-10 flex items-center justify-center text-2xl transition-colors"
          style={{ color: "var(--color-muted)" }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.color = "var(--color-text)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.color = "var(--color-muted)")
          }
        >
          ×
        </button>

        {item.title && (
          <div
            className="absolute bottom-0 left-0 right-0 p-4 text-sm"
            style={{ color: "var(--color-muted)", textAlign: "center" }}
          >
            {item.title}
          </div>
        )}
      </div>
    </div>
  )
}
