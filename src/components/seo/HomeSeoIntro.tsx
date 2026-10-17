import Link from "next/link"

/**
 * Bloc texte de l'accueil, rendu côté serveur : donne à Google le sujet du site
 * (photo/vidéo de surf au Pays basque et dans les Landes, tirages de paysages)
 * et des liens internes vers les pages clés.
 */
export default function HomeSeoIntro() {
  const links = [
    { href: "/photographe-surf-pays-basque-landes", label: "Séances photo & vidéo de surf" },
    { href: "/tirages-photo-paysage", label: "Tirages photo de paysages" },
    { href: "/portfolio/surf", label: "Portfolio surf" },
    { href: "/devis", label: "Demander un devis" },
  ]
  return (
    <section className="py-20 px-6" style={{ borderTop: "1px solid var(--color-border)" }}>
      <div className="max-w-4xl mx-auto">
        <p className="font-mono-data text-xs uppercase mb-4" style={{ color: "var(--color-accent)", letterSpacing: "0.25em" }}>
          Bidart · Pays basque &amp; Landes
        </p>
        <h2 className="text-3xl md:text-5xl" style={{ color: "var(--color-text)" }}>
          Photographe et vidéaste surf, tirages de paysages
        </h2>
        <div className="mt-6 space-y-4 leading-relaxed" style={{ color: "var(--color-muted)" }}>
          <p>
            Basé à Bidart, je photographie et je filme les surfeurs sur toute la côte du Pays basque et des Landes :
            Biarritz, Anglet, Guéthary, Saint-Jean-de-Luz, Hendaye, Hossegor, Seignosse ou Capbreton. Mes séances
            s’adressent à tous les niveaux, du{" "}
            <Link href="/photographe-surf-pays-basque-landes" className="underline" style={{ color: "var(--color-text)" }}>
              débutant qui veut garder un souvenir de ses premières vagues au surfeur pro qui prépare son book
            </Link>
            , en photo, en vidéo ou au drone.
          </p>
          <p>
            Entre deux sessions, je parcours l’océan, la montagne et le monde pour mes séries de paysages, disponibles en{" "}
            <Link href="/tirages-photo-paysage" className="underline" style={{ color: "var(--color-text)" }}>
              tirages Fine Art et papier photo
            </Link>{" "}
            livrés gratuitement en France.
          </p>
        </div>
        <nav aria-label="Accès rapides" className="mt-8 flex flex-wrap gap-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-xs uppercase px-5 py-2.5 rounded-full border"
              style={{ color: "var(--color-accent)", borderColor: "var(--color-accent)", letterSpacing: "0.15em" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  )
}
