import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { client } from "@/lib/sanity.client"
import { urlFor } from "@/lib/image"
import { slugifyCollection } from "@/lib/shop"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Boutique Fine Art",
  description: "Tirages Fine Art d'aventure et de sports nautiques. Éditions limitées, certificat d'authenticité.",
}

const QUERY = `
*[_type == "product" && (defined(collection) || defined(photo))] | order(_createdAt asc) {
  _id,
  "collection": coalesce(collection->title, photo->collection->title),
  "image": coalesce(image, photo->image),
  title
}
`

type CollectionSummary = {
  name: string
  slug: string
  cover: any
  count: number
}

export default async function BoutiquePage() {
  const products = await client.fetch(QUERY)

  // Group by collection
  const map = new Map<string, CollectionSummary>()
  for (const p of products) {
    if (!p.collection) continue
    if (!map.has(p.collection)) {
      map.set(p.collection, {
        name: p.collection,
        slug: slugifyCollection(p.collection),
        cover: p.image,
        count: 0,
      })
    }
    map.get(p.collection)!.count++
  }
  const collections = Array.from(map.values())

  return (
    <>
      {/* Header */}
      <div className="pt-32 pb-16 px-6 text-center" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "var(--color-text)" }}>
          DE NOUVEAU DISPONIBLE PROCHAINEMENT
        </h1>
        <p className="text-xs uppercase font-semibold mb-4" style={{ color: "var(--color-accent)", letterSpacing: "0.3em" }}>
          Fine Art
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "var(--color-text)" }}>
          Boutique
        </h1>
        <p className="max-w-xl mx-auto text-base" style={{ color: "var(--color-muted)" }}>
          Des tirages Fine Art sur papier Hahnemühle, encadrables, numérotés et signés.
          Chaque image raconte une aventure vécue. 
        </p>
      </div>

      {/* Collections grid */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          {collections.length === 0 ? (
            <div className="py-20 text-center" style={{ color: "var(--color-muted)" }}>
              <p>Aucune collection disponible. Ajoutez des produits avec une collection dans Sanity Studio.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {collections.map((col) => (
                <Link
                  key={col.name}
                  href={`/boutique/${col.slug}`}
                  className="group block relative overflow-hidden"
                  style={{ aspectRatio: "4/5" }}
                >
                  {col.cover && (
                    <Image
                      src={urlFor(col.cover).width(800).quality(88).url()}
                      alt={col.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width:768px) 100vw, 33vw"
                    />
                  )}

                  {/* Gradient overlay */}
                  <div
                    className="absolute inset-0 transition-opacity duration-500"
                    style={{
                      background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%)",
                    }}
                  />

                  {/* Text */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-xs uppercase mb-2" style={{ color: "var(--color-accent)", letterSpacing: "0.2em" }}>
                      {col.count} tirage{col.count > 1 ? "s" : ""}
                    </p>
                    <h2 className="text-xl font-bold text-white leading-tight mb-3">
                      {col.name}
                    </h2>
                    <span
                      className="inline-block text-xs uppercase px-4 py-2 border border-white/30 text-white/70 transition-all duration-300 group-hover:bg-[var(--color-accent)] group-hover:text-black group-hover:border-[var(--color-accent)]"
                      style={{ letterSpacing: "0.15em" }}
                    >
                      Voir la collection →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Réassurance */}
      <div className="py-16 px-6" style={{ borderTop: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: "🖨️", label: "Papier Hahnemühle", desc: "Qualité Fine Art" },
            { icon: "🔢", label: "Éditions numérotées", desc: "Tirages limités" },
            { icon: "📜", label: "Certificat inclus", desc: "Authenticité garantie" },
            { icon: "🌊", label: "Livraison France", desc: "Emballage sécurisé" },
          ].map((item) => (
            <div key={item.label}>
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-text)" }}>{item.label}</p>
              <p className="text-xs" style={{ color: "var(--color-muted)" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
