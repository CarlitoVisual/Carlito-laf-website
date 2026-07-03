import type { Metadata } from "next"
import ContactBlock from "@/components/blocks/ContactBlock"

export const metadata: Metadata = {
  title: "Demande de devis",
  description:
    "Décrivez votre projet photo ou vidéo aventure et recevez un devis personnalisé sous 48h.",
}

export default function DevisPage() {
  return (
    <>
      {/* Page header */}
      <div
        className="pt-32 pb-16 px-6 text-center"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <p
          className="text-xs uppercase font-semibold mb-4"
          style={{ color: "var(--color-accent)", letterSpacing: "0.3em" }}
        >
          Prestations
        </p>
        <h1
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{ color: "var(--color-text)" }}
        >
          Demande de devis
        </h1>
        <p className="max-w-xl mx-auto" style={{ color: "var(--color-muted)" }}>
          Décrivez votre projet en détail. Je vous réponds sous 48h avec une
          proposition personnalisée et transparente.
        </p>
      </div>

      <ContactBlock
        formType="devis"
        title="Votre projet"
        intro="Plus votre description est précise, plus le devis sera adapté à vos besoins."
      />

      {/* Réassurance */}
      <div
        className="py-16 px-6"
        style={{
          background: "var(--color-surface)",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          {[
            {
              icon: "⚡",
              title: "Réponse rapide",
              desc: "Devis envoyé sous 48h, souvent le jour même.",
            },
            {
              icon: "🎯",
              title: "Sur mesure",
              desc: "Chaque projet est unique. Le devis est adapté à vos contraintes.",
            },
            {
              icon: "🤝",
              title: "Sans engagement",
              desc: "Le devis est gratuit et sans obligation de votre part.",
            },
          ].map((item) => (
            <div key={item.title}>
              <div className="text-3xl mb-3">{item.icon}</div>
              <p
                className="font-semibold mb-2"
                style={{ color: "var(--color-text)" }}
              >
                {item.title}
              </p>
              <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
