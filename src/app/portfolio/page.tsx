import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { client } from "@/lib/sanity.client"
import { urlFor } from "@/lib/image"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Collections photo et vidéo d'aventure et de sports nautiques par Carlito Laf Visuel.",
}

// Fetch configured collections first, then fall back to ungrouped photos
const COLLECTIONS_QUERY = `
*[_type == "collection" && visible == true] | order(coalesce(order, 9999) asc, title asc) {
  title,
  "slug": slug.current,
  description,
  "coverImage": coalesce(
    coverPhoto->image,
    *[_type == "photo" && collection._ref == ^._id && defined(image)] | order(_createdAt asc) [0].image
  ),
  "count": count(*[_type == "photo" && collection._ref == ^._id])
}
`

type CollectionCard = {
  title: string
  slug: string
  description?: string
  coverImage: any
  count: number
}

export default async function PortfolioPage() {
  const collections: CollectionCard[] = await client.fetch(COLLECTIONS_QUERY)

  return (
    <>
      {/* Header */}
      <div
        className="pt-32 pb-16 px-6 text-center"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <p className="text-xs uppercase font-semibold mb-4" style={{ color: "var(--color-accent)", letterSpacing: "0.3em" }}>
          Portfolio
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "var(--color-text)" }}>
          Collections
        </h1>
        <p className="max-w-xl mx-auto" style={{ color: "var(--color-muted)" }}>
          Aventure, océan, sports nautiques — chaque collection raconte une histoire.
        </p>
      </div>

      {/* Collections grid */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          {collections.length === 0 ? (
            <div className="py-24 text-center" style={{ color: "var(--color-muted)" }}>
              <p className="mb-4">Aucune collection visible.</p>
              <p className="text-sm">
                Dans Sanity Studio, créez des documents <strong>Collection Portfolio</strong> et activez-les.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {collections.map((col, i) => {
                const isFirst = i === 0 && collections.length > 2
                return (
                  <Link
                    key={col.title}
                    href={`/portfolio/${col.slug}`}
                    className="group relative block overflow-hidden"
                    style={{
                      aspectRatio: isFirst ? "16/9" : "4/3",
                      gridColumn: isFirst ? "1 / -1" : undefined,
                      background: "var(--color-surface)",
                      minHeight: 280,
                    }}
                  >
                    {col.coverImage && (
                      <Image
                        src={urlFor(col.coverImage).width(isFirst ? 1400 : 900).quality(88).url()}
                        alt={col.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        sizes={isFirst ? "100vw" : "(max-width:768px) 100vw, 50vw"}
                        priority={i === 0}
                      />
                    )}

                    {/* Gradient */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)",
                      }}
                    />

                    {/* Text */}
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <p className="text-xs uppercase mb-2" style={{ color: "var(--color-accent)", letterSpacing: "0.2em" }}>
                        {col.count} photo{col.count > 1 ? "s" : ""}
                      </p>
                      <h2 className="text-2xl font-bold text-white mb-2">{col.title}</h2>
                      {col.description && (
                        <p className="text-sm mb-4 max-w-md" style={{ color: "rgba(255,255,255,0.65)" }}>
                          {col.description}
                        </p>
                      )}
                      <span
                        className="inline-block text-xs uppercase px-4 py-2 border border-white/35 text-white/75 transition-all duration-300 group-hover:bg-white group-hover:text-black group-hover:border-white"
                        style={{ letterSpacing: "0.15em" }}
                      >
                        Voir la collection →
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
