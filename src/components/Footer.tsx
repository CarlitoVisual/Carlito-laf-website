import Link from "next/link"

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--color-surface)",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <p
              className="text-xl font-bold tracking-widest uppercase mb-4"
              style={{ letterSpacing: "0.2em", color: "var(--color-text)" }}
            >
              Carlito Laf
              <span style={{ color: "var(--color-accent)" }}> Visuel</span>
            </p>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--color-muted)" }}>
              Photographe et vidéaste passionné depuis 10 ans, je vous accompagne dans vos aventures, 
              événements et disciplines sportives afin de les figer 
              dans des capsules visuelles de haute qualité. 
              La passion au service de vos projets les plus ambitieux.
            </p>
            <div className="flex gap-4">
              {[
                { label: "Instagram", href: "https://www.instagram.com/carlito_laf/" },

              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs uppercase transition-colors"
                  style={{ color: "var(--color-muted)", letterSpacing: "0.12em" }}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p
              className="text-xs uppercase font-semibold mb-6"
              style={{ color: "var(--color-accent)", letterSpacing: "0.2em" }}
            >
              Navigation
            </p>
            <nav className="flex flex-col gap-3">
              {[
                { href: "/portfolio", label: "Portfolio" },
                { href: "/prestations", label: "Prestations" },
                { href: "/boutique", label: "Boutique Fine Art" },
                { href: "/contact", label: "Contact" },
                { href: "/devis", label: "Demande de devis" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm transition-colors"
                  style={{ color: "var(--color-muted)" }}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <p
              className="text-xs uppercase font-semibold mb-6"
              style={{ color: "var(--color-accent)", letterSpacing: "0.2em" }}
            >
              Contact
            </p>
            <div className="flex flex-col gap-3 text-sm" style={{ color: "var(--color-muted)" }}>
              <p>charleslaf.photo@gmail.com</p>
              <p>Disponible sur devis</p>
              <p>France</p>
              <Link
                href="/devis"
                className="inline-block mt-2 text-xs uppercase text-center px-4 py-2 border transition-all"
                style={{
                  color: "var(--color-accent)",
                  borderColor: "var(--color-accent)",
                  letterSpacing: "0.15em",
                }}
              >
                Devis gratuit →
              </Link>
            </div>
          </div>
        </div>

        <div
          className="mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs"
          style={{
            borderTop: "1px solid var(--color-border)",
            color: "var(--color-muted)",
          }}
        >
          <p>© {new Date().getFullYear()} Carlito Laf Visuel. Tous droits réservés.</p>
          <p>Photos &amp; vidéos — Droits d&apos;auteur protégés.</p>
        </div>
      </div>
    </footer>
  )
}
