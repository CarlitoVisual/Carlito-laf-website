"use client"

import { useState } from "react"
import ProductViewer from "./ProductViewer"
import type { Product } from "@/types/sanity"

type Props = {
  product: Product
  disabled?: boolean
}

export default function ProductViewerTrigger({ product, disabled }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => !disabled && setOpen(true)}
        disabled={disabled}
        className="text-xs uppercase px-5 py-2.5 font-semibold transition-all duration-200 rounded-full"
        style={{
          background: disabled ? "var(--color-border)" : "var(--color-accent)",
          color: disabled ? "var(--color-muted)" : "var(--color-on-accent)",
          letterSpacing: "0.15em",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {disabled ? "Épuisé" : "Voir le tirage"}
      </button>

      {open && (
        <ProductViewer product={product} onClose={() => setOpen(false)} />
      )}
    </>
  )
}
