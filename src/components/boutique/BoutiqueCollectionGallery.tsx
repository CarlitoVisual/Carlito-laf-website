"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { urlFor } from "@/lib/image"
import { formatPrice, startingPrice, isProductAvailable } from "@/lib/shop"
import ProductViewer from "./ProductViewer"

export type BoutiqueProduct = {
  _id: string
  title: string
  shortDescription?: string
  image: any
  price?: number
  currency?: string
  formats?: Array<{ name: string; price: number; stock?: number }>
  edition?: { limited?: boolean; number?: number; certificate?: boolean }
  collection?: string
  paymentUrl?: string
  featured?: boolean
}

/* ─────────────────────────────── Lightbox ─────────────────────────────── */

function Lightbox({ products, index, onClose, onNav, onShowViewer }: {
  products: BoutiqueProduct[]
  index: number
  onClose: () => void
  onNav: (i: number) => void
  onShowViewer: (product: BoutiqueProduct) => void
}) {
  const product = products[index]
  const touchStartX = useRef<number | null>(null)
  const price = startingPrice(product)
  const available = isProductAvailable(product)

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") onNav((index + 1) % products.length)
      if (e.key === "ArrowLeft") onNav((index - 1 + products.length) % products.length)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [index, products.length, onClose, onNav])

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 50) onNav(dx < 0 ? (index + 1) % products.length : (index - 1 + products.length) % products.length)
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
          {index + 1} / {products.length}
        </span>
        <button
          onClick={onClose}
          style={{ color: "#fff", background: "none", border: "none", fontSize: 28, cursor: "pointer", lineHeight: 1, padding: "0 4px" }}
          aria-label="Fermer"
        >×</button>
      </div>

      {/* Image area */}
      <div style={{ flex: 1, position: "relative", minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {products.length > 1 && (
          <button
            onClick={() => onNav((index - 1 + products.length) % products.length)}
            style={{
              position: "absolute", left: 16, zIndex: 1,
              width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
              color: "#fff", fontSize: 22, cursor: "pointer", backdropFilter: "blur(4px)",
            }}
            aria-label="Précédent"
          >‹</button>
        )}

        <div style={{ position: "relative", width: "100%", height: "100%", maxWidth: "90vw", maxHeight: "80vh" }}>
          {product.image && (
            <Image
              key={product._id}
              src={urlFor(product.image).width(1800).quality(90).url()}
              alt={product.title}
              fill
              style={{ objectFit: "contain" }}
              sizes="90vw"
              priority
            />
          )}
        </div>

        {products.length > 1 && (
          <button
            onClick={() => onNav((index + 1) % products.length)}
            style={{
              position: "absolute", right: 16, zIndex: 1,
              width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
              color: "#fff", fontSize: 22, cursor: "pointer", backdropFilter: "blur(4px)",
            }}
            aria-label="Suivant"
          >›</button>
        )}
      </div>

      {/* Bottom bar */}
      <div style={{ flexShrink: 0, padding: "20px 24px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <p style={{ color: "#fff", fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{product.title}</p>
          {price !== null && (
            <p style={{ color: "var(--color-accent)", fontSize: 13, fontWeight: 700 }}>
              À partir de {formatPrice(price, product.currency || "EUR")}
            </p>
          )}
          {product.edition?.limited && product.edition?.number && (
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 2 }}>
              Édition limitée · {product.edition.number} ex.
            </p>
          )}
        </div>

        <button
          onClick={() => onShowViewer(product)}
          disabled={!available}
          style={{
            padding: "12px 28px",
            background: available ? "var(--color-accent)" : "var(--color-border)",
            color: available ? "#000" : "var(--color-muted)",
            fontWeight: 700, fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase",
            border: "none", cursor: available ? "pointer" : "not-allowed",
            opacity: available ? 1 : 0.6,
          }}
        >
          {available ? "Voir le tirage" : "Épuisé"}
        </button>
      </div>

      {/* Dot strip */}
      {products.length > 1 && products.length <= 20 && (
        <div style={{ flexShrink: 0, display: "flex", justifyContent: "center", gap: 6, paddingBottom: 16 }}>
          {products.map((_, i) => (
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

/* ──────────────────────────── Gallery grid ─────────────────────────────── */

export default function BoutiqueCollectionGallery({ products }: { products: BoutiqueProduct[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [viewerProduct, setViewerProduct] = useState<BoutiqueProduct | null>(null)

  const openViewer = useCallback((product: BoutiqueProduct) => {
    setLightboxIndex(null)
    setViewerProduct(product)
  }, [])

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {products.map((product, i) => {
          const available = isProductAvailable(product)
          const price = startingPrice(product)
          const currency = product.currency || "EUR"

          return (
            <div key={product._id} className="group flex flex-col">
              {/* Image — click to open lightbox */}
              <div
                onClick={() => setLightboxIndex(i)}
                style={{
                  position: "relative",
                  aspectRatio: "3/4",
                  minHeight: 320,
                  background: "var(--color-surface)",
                  overflow: "hidden",
                  cursor: "zoom-in",
                  marginBottom: 20,
                }}
              >
                {product.image && (
                  <Image
                    src={urlFor(product.image).width(700).quality(90).url()}
                    alt={product.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                  />
                )}

                {!available && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(10,10,10,0.65)" }}>
                    <span style={{ color: "var(--color-muted)", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase" }}>Épuisé</span>
                  </div>
                )}

                {product.edition?.limited && (
                  <div style={{ position: "absolute", top: 12, left: 12, padding: "4px 8px", background: "var(--color-accent)", color: "#000", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Édition limitée
                  </div>
                )}

                {/* Hover zoom hint */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.18)" }}
                >
                  <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                    Agrandir
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col">
                <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--color-text)" }}>
                  {product.title}
                </h2>

                {product.shortDescription && (
                  <p className="text-sm mb-3" style={{ color: "var(--color-muted)" }}>
                    {product.shortDescription}
                  </p>
                )}

                {(product.formats?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {product.formats!.map((f, j) => {
                      const avail = (f.stock ?? 1) > 0
                      return (
                        <span
                          key={j}
                          className="text-xs px-2.5 py-1 border"
                          style={{
                            borderColor: avail ? "var(--color-border)" : "transparent",
                            color: avail ? "var(--color-muted)" : "var(--color-border)",
                            textDecoration: avail ? "none" : "line-through",
                            background: avail ? "transparent" : "var(--color-surface)",
                          }}
                        >
                          {f.name}
                        </span>
                      )
                    })}
                  </div>
                )}

                {product.edition?.number && (
                  <p className="text-xs mb-4" style={{ color: "var(--color-muted)" }}>
                    {product.edition.number} ex.{product.edition.certificate ? " · Certifié" : ""}
                  </p>
                )}

                <div className="flex items-center justify-between mt-auto pt-4" style={{ borderTop: "1px solid var(--color-border)" }}>
                  {price !== null && (
                    <p className="font-bold" style={{ color: "var(--color-accent)" }}>
                      À partir de {formatPrice(price, currency)}
                    </p>
                  )}
                  <button
                    onClick={() => openViewer(product)}
                    disabled={!available}
                    className="text-xs uppercase px-5 py-2.5 font-semibold transition-all duration-200"
                    style={{
                      background: !available ? "var(--color-border)" : "var(--color-accent)",
                      color: !available ? "var(--color-muted)" : "#000",
                      letterSpacing: "0.15em",
                      cursor: !available ? "not-allowed" : "pointer",
                      opacity: !available ? 0.6 : 1,
                      border: "none",
                    }}
                  >
                    {!available ? "Épuisé" : "Voir le tirage"}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          products={products}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNav={setLightboxIndex}
          onShowViewer={openViewer}
        />
      )}

      {viewerProduct && (
        <ProductViewer product={viewerProduct} onClose={() => setViewerProduct(null)} />
      )}
    </>
  )
}
