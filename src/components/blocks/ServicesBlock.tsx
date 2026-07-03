import Image from "next/image"
import Link from "next/link"
import { client } from "@/lib/sanity.client"
import { urlFor } from "@/lib/image"
import ServiceCarousel from "./ServiceCarousel"

const SERVICE_FIELDS = `_id, title, "slug": slug.current, category, shortDescription, coverImage, price, currency, priceType, deliverables, featured`

async function resolveServices(props: any): Promise<any[]> {
  const { displayMode, items } = props
  if (items?.length) return items
  if (displayMode === "featured") {
    return client.fetch(`*[_type == "service" && featured == true] | order(coalesce(order, 9999) asc, title asc) { ${SERVICE_FIELDS} }`)
  }
  return client.fetch(`*[_type == "service"] | order(coalesce(order, 9999) asc, title asc) { ${SERVICE_FIELDS} }`)
}

function priceLabel(s: any): string | null {
  if (!s.price) return null
  const curr = s.currency === "EUR" ? "€" : (s.currency ?? "€")
  if (s.priceType === "starting") return `À partir de ${s.price}${curr}`
  if (s.priceType === "fixed") return `${s.price}${curr}`
  return null
}

export default async function ServicesBlock(props: any) {
  const { title, intro, layout = "grid", buttonLabel = "Découvrir" } = props
  const services = await resolveServices(props)

  const Header = () => (title || intro) ? (
    <div className="max-w-7xl mx-auto px-6 py-16 pb-0">
      {title && (
        <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "var(--color-text)" }}>{title}</h2>
      )}
      {intro && (
        <p className="max-w-2xl" style={{ color: "var(--color-muted)" }}>{intro}</p>
      )}
    </div>
  ) : null

  if (services.length === 0) {
    return (
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto py-20 text-center border" style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}>
          <p>Aucune prestation. Ajoutez des services dans Sanity Studio → Documents → Services.</p>
        </div>
      </section>
    )
  }

  // ── Carousel immersif ──────────────────────────────────────────
  if (layout === "carousel") {
    return (
      <section>
        <Header />
        <ServiceCarousel services={services} buttonLabel={buttonLabel} />
      </section>
    )
  }

  // ── Grille / Liste / Cards ─────────────────────────────────────
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {title && (
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "var(--color-text)" }}>{title}</h2>
        )}
        {intro && (
          <p className="mb-14 max-w-2xl" style={{ color: "var(--color-muted)" }}>{intro}</p>
        )}

        {layout === "list" ? (
          <div className="flex flex-col divide-y" style={{ borderColor: "var(--color-border)" }}>
            {services.map((s: any) => (
              <div key={s._id} className="flex gap-8 py-10 items-start">
                {s.coverImage && (
                  <div className="relative flex-shrink-0 hidden md:block" style={{ width: 180, height: 120 }}>
                    <Image src={urlFor(s.coverImage).width(360).quality(80).url()} alt={s.title} fill className="object-cover" sizes="180px" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--color-text)" }}>{s.title}</h3>
                  {s.shortDescription && <p className="text-sm mb-4" style={{ color: "var(--color-muted)" }}>{s.shortDescription}</p>}
                  {priceLabel(s) && <p className="font-bold text-sm" style={{ color: "var(--color-accent)" }}>{priceLabel(s)}</p>}
                </div>
                {s.slug && (
                  <Link href={`/prestations/${s.slug}`} className="flex-shrink-0 text-xs uppercase px-5 py-2.5 border self-center"
                    style={{ color: "var(--color-accent)", borderColor: "var(--color-accent)", letterSpacing: "0.15em" }}>
                    {buttonLabel} →
                  </Link>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={`grid grid-cols-1 gap-8 ${layout === "cards" ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"}`}>
            {services.map((s: any) => (
              <Link
                key={s._id}
                href={s.slug ? `/prestations/${s.slug}` : "/devis"}
                className="group flex flex-col overflow-hidden"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", textDecoration: "none" }}
              >
                {s.coverImage && (
                  <div className="relative overflow-hidden" style={{ height: layout === "cards" ? 280 : 220 }}>
                    <Image
                      src={urlFor(s.coverImage).width(800).quality(85).url()}
                      alt={s.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width:768px) 100vw, 50vw"
                    />
                    {s.category && (
                      <span className="absolute top-3 left-3 text-xs uppercase px-2 py-1"
                        style={{ background: "var(--color-accent)", color: "#000", letterSpacing: "0.1em" }}>
                        {s.category}
                      </span>
                    )}
                  </div>
                )}
                <div className="flex flex-col flex-1 p-7">
                  <h3 className="text-xl font-semibold mb-3" style={{ color: "var(--color-text)" }}>{s.title}</h3>
                  {s.shortDescription && (
                    <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: "var(--color-muted)" }}>{s.shortDescription}</p>
                  )}
                  {s.deliverables?.length > 0 && (
                    <ul className="mb-6 space-y-1.5">
                      {s.deliverables.slice(0, 4).map((d: string, j: number) => (
                        <li key={j} className="text-xs flex items-start gap-2" style={{ color: "var(--color-muted)" }}>
                          <span className="flex-shrink-0" style={{ color: "var(--color-accent)" }}>—</span>
                          {d}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex items-center justify-between pt-5 mt-auto" style={{ borderTop: "1px solid var(--color-border)" }}>
                    <div>
                      {priceLabel(s) && <p className="font-bold text-sm" style={{ color: "var(--color-accent)" }}>{priceLabel(s)}</p>}
                      {!s.price && <p className="text-xs" style={{ color: "var(--color-muted)" }}>Sur devis</p>}
                    </div>
                    <span className="text-xs uppercase px-4 py-2 border text-[var(--color-accent)] border-[var(--color-accent)] transition-all group-hover:bg-[var(--color-accent)] group-hover:text-black"
                      style={{ letterSpacing: "0.15em" }}>
                      {buttonLabel} →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
