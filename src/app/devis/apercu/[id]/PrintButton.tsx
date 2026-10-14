"use client"

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print min-h-12 px-7 rounded-full text-sm font-bold uppercase"
      style={{ background: "#051B2E", color: "#fff", letterSpacing: "0.1em" }}
    >
      Imprimer / Enregistrer en PDF
    </button>
  )
}
