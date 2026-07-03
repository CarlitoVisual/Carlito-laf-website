"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { urlFor } from "@/lib/image"
import { formatPrice, isFormatAvailable } from "@/lib/shop"

type Props = {
  product: any
  onClose: () => void
}

type OrderStatus = "idle" | "sending" | "sent" | "error"

export default function ProductViewer({ product, onClose }: Props) {
  const formats = product.formats ?? []
  const availableFormats = formats.filter(isFormatAvailable)

  const [selectedFormat, setSelectedFormat] = useState<any>(availableFormats[0] ?? null)
  const [qty, setQty] = useState(1)
  const [activeImage, setActiveImage] = useState<any>(product.image)
  const [showOrder, setShowOrder] = useState(false)
  const [status, setStatus] = useState<OrderStatus>("idle")
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", company: "" })

  const currency = product.currency || "EUR"
  const unitPrice = selectedFormat?.price ?? product.price ?? 0
  const total = unitPrice * qty
  const maxQty = selectedFormat ? Math.min(selectedFormat.stock ?? 5, 5) : 5

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [onClose])

  useEffect(() => {
    setQty(1)
    setShowOrder(false)
    setStatus("idle")
  }, [selectedFormat])

  function changeField(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleOrder(e: React.FormEvent) {
    e.preventDefault()
    setStatus("sending")
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: product.title,
          collection: product.collection,
          format: selectedFormat?.name,
          qty,
          unitPrice,
          total,
          currency,
          paymentUrl: product.paymentUrl,
          ...form,
        }),
      })
      if (!res.ok) throw new Error()
      setStatus("sent")
    } catch {
      setStatus("error")
    }
  }

  const inputStyle: React.CSSProperties = {
    background: "var(--color-bg)",
    border: "1px solid var(--color-border)",
    color: "var(--color-text)",
    padding: "0.65rem 0.9rem",
    fontSize: "0.875rem",
    width: "100%",
    outline: "none",
  }

  const allImages = product.gallery?.length ? [product.image, ...product.gallery] : []

  const modal = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        background: "rgba(0,0,0,0.85)",
      }}
      onClick={onClose}
    >
      {/* Drawer — slides up from bottom on all screens */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderBottom: "none",
          width: "100%",
          maxWidth: 960,
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            zIndex: 10,
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            color: "var(--color-muted)",
            background: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            cursor: "pointer",
          }}
        >
          ×
        </button>

        {/* Two-column on md+, stacked on mobile */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden", flexDirection: "row" }}>

          {/* ── Left: image ── */}
          <div
            style={{
              flexShrink: 0,
              width: "42%",
              position: "relative",
              background: "var(--color-bg)",
              flexDirection: "column",
              display: "flex",
            }}
          >
            {/* Main image */}
            <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
              {activeImage && (
                <Image
                  src={urlFor(activeImage).width(700).quality(92).url()}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="42vw"
                  priority
                />
              )}
            </div>
            {/* Thumbnail strip */}
            {allImages.length > 1 && (
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  padding: "10px 12px",
                  background: "var(--color-bg)",
                  borderTop: "1px solid var(--color-border)",
                  overflowX: "auto",
                }}
              >
                {allImages.map((img: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    style={{
                      flexShrink: 0,
                      width: 48,
                      height: 48,
                      position: "relative",
                      overflow: "hidden",
                      outline: activeImage === img
                        ? "2px solid var(--color-accent)"
                        : "1px solid var(--color-border)",
                      cursor: "pointer",
                    }}
                  >
                    <Image src={urlFor(img).width(96).quality(70).url()} alt="" fill className="object-cover" sizes="48px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: details ── */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "28px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 20,
              minWidth: 0,
            }}
          >

            {/* Header */}
            <div style={{ paddingTop: 4 }}>
              {product.collection && (
                <p style={{
                  color: "var(--color-accent)",
                  fontSize: "0.7rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}>
                  {product.collection}
                </p>
              )}
              <h2 style={{ color: "var(--color-text)", fontSize: "1.4rem", fontWeight: 700, lineHeight: 1.2 }}>
                {product.title}
              </h2>
              {product.shortDescription && (
                <p style={{ color: "var(--color-muted)", fontSize: "0.875rem", marginTop: 8 }}>
                  {product.shortDescription}
                </p>
              )}
              {product.edition?.number && (
                <p style={{ color: "var(--color-muted)", fontSize: "0.75rem", marginTop: 6 }}>
                  Tirage limité · {product.edition.number} ex.
                  {product.edition.certificate ? " · Certificat d'authenticité" : ""}
                </p>
              )}
            </div>

            <div style={{ height: 1, background: "var(--color-border)", flexShrink: 0 }} />

            {/* Format selector */}
            {formats.length > 0 && (
              <div>
                <p style={{ color: "var(--color-muted)", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, marginBottom: 10 }}>
                  Format
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {formats.map((f: any, i: number) => {
                    const avail = isFormatAvailable(f)
                    const selected = selectedFormat?.name === f.name
                    return (
                      <button
                        key={i}
                        disabled={!avail}
                        onClick={() => avail && setSelectedFormat(f)}
                        style={{
                          padding: "10px 16px",
                          fontSize: "0.82rem",
                          border: `1px solid ${selected ? "var(--color-accent)" : avail ? "var(--color-border)" : "var(--color-border)"}`,
                          background: selected ? "var(--color-accent)" : "transparent",
                          color: selected ? "#000" : avail ? "var(--color-text)" : "var(--color-muted)",
                          textDecoration: avail ? "none" : "line-through",
                          cursor: avail ? "pointer" : "not-allowed",
                          fontWeight: selected ? 600 : 400,
                          opacity: avail ? 1 : 0.45,
                          transition: "all 0.15s",
                        }}
                      >
                        {f.name}{f.price ? ` — ${formatPrice(f.price, currency)}` : ""}
                        {!avail ? " (épuisé)" : ""}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p style={{ color: "var(--color-muted)", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, marginBottom: 10 }}>
                Quantité
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  style={{
                    width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1px solid var(--color-border)", color: "var(--color-text)", background: "var(--color-bg)",
                    fontSize: "1.2rem", cursor: "pointer",
                  }}
                >−</button>
                <span style={{ color: "var(--color-text)", fontWeight: 600, fontSize: "1.1rem", width: 28, textAlign: "center" }}>
                  {qty}
                </span>
                <button
                  onClick={() => setQty(q => Math.min(maxQty, q + 1))}
                  disabled={qty >= maxQty}
                  style={{
                    width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1px solid var(--color-border)",
                    color: qty >= maxQty ? "var(--color-border)" : "var(--color-text)",
                    background: "var(--color-bg)",
                    fontSize: "1.2rem",
                    cursor: qty >= maxQty ? "not-allowed" : "pointer",
                  }}
                >+</button>
                {selectedFormat?.stock != null && (
                  <span style={{ color: "var(--color-muted)", fontSize: "0.75rem" }}>
                    {selectedFormat.stock} disponible{selectedFormat.stock > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>

            {/* Total */}
            {unitPrice > 0 && (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 0",
                borderTop: "1px solid var(--color-border)",
                borderBottom: "1px solid var(--color-border)",
              }}>
                <span style={{ color: "var(--color-muted)", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Total
                </span>
                <span style={{ color: "var(--color-accent)", fontWeight: 700, fontSize: "1.6rem" }}>
                  {formatPrice(total, currency)}
                </span>
              </div>
            )}

            {/* CTA / Form */}
            {!showOrder ? (
              <button
                onClick={() => setShowOrder(true)}
                disabled={!selectedFormat && formats.length > 0}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: "var(--color-accent)",
                  color: "#000",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  opacity: (!selectedFormat && formats.length > 0) ? 0.4 : 1,
                  border: "none",
                }}
              >
                Acheter ce tirage
              </button>
            ) : status === "sent" ? (
              <div style={{ padding: "24px 0", textAlign: "center" }}>
                <p style={{ color: "var(--color-accent)", fontWeight: 700, fontSize: "1.1rem", marginBottom: 8 }}>
                  Demande envoyée ✓
                </p>
                <p style={{ color: "var(--color-muted)", fontSize: "0.875rem" }}>
                  Je vous recontacte sous 48h avec les instructions de paiement.
                </p>
              </div>
            ) : (
              <form onSubmit={handleOrder} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={changeField}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
                />
                <p style={{ color: "var(--color-muted)", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>
                  Vos coordonnées
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <input name="name" required placeholder="Prénom Nom *" value={form.name} onChange={changeField} style={inputStyle} />
                  <input name="email" type="email" required placeholder="Email *" value={form.email} onChange={changeField} style={inputStyle} />
                </div>
                <input name="phone" placeholder="Téléphone" value={form.phone} onChange={changeField} style={inputStyle} />
                <textarea
                  name="message"
                  placeholder="Questions, adresse de livraison, remarques..."
                  rows={3}
                  value={form.message}
                  onChange={changeField}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
                {status === "error" && (
                  <p style={{ color: "#ef4444", fontSize: "0.8rem" }}>
                    Erreur — contactez-moi directement : charleslaf.photo@gmail.com
                  </p>
                )}
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setShowOrder(false)}
                    style={{
                      flex: 1, padding: "12px",
                      color: "var(--color-muted)",
                      border: "1px solid var(--color-border)",
                      background: "transparent",
                      fontSize: "0.75rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                    }}
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    style={{
                      flex: 2, padding: "12px",
                      background: "var(--color-accent)",
                      color: "#000",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      border: "none",
                      cursor: "pointer",
                      opacity: status === "sending" ? 0.6 : 1,
                    }}
                  >
                    {status === "sending" ? "Envoi..." : "Confirmer la demande"}
                  </button>
                </div>
                <p style={{ color: "var(--color-muted)", fontSize: "0.72rem", textAlign: "center" }}>
                  Sans engagement — je vous enverrai le lien de paiement sécurisé.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
