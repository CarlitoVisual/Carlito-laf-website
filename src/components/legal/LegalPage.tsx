import type { ReactNode } from "react"
import { LEGAL } from "@/lib/legal"

type Props = {
  eyebrow?: string
  title: string
  intro?: ReactNode
  children: ReactNode
}

/** Mise en page commune des pages juridiques (mentions légales, CGV, confidentialité…). */
export default function LegalPage({ eyebrow = "Informations légales", title, intro, children }: Props) {
  return (
    <>
      <div className="pt-32 pb-12 px-6 text-center" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <p className="font-mono-data text-xs uppercase mb-4" style={{ color: "var(--color-data)", letterSpacing: "0.18em" }}>
          {eyebrow}
        </p>
        <h1 className="text-5xl md:text-6xl mb-4" style={{ color: "var(--color-text)" }}>
          {title}
        </h1>
        {intro && (
          <div className="max-w-2xl mx-auto" style={{ color: "var(--color-muted)" }}>
            {intro}
          </div>
        )}
        <p className="font-mono-data text-xs mt-6" style={{ color: "var(--color-muted)" }}>
          Dernière mise à jour : {LEGAL.updatedAt}
        </p>
      </div>
      <article className="legal-prose max-w-3xl mx-auto px-6 py-16">{children}</article>
    </>
  )
}
