import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { client } from "@/lib/sanity.client"
import { slugifyCollection, matchCollection } from "@/lib/shop"
import BoutiqueCollectionGallery from "@/components/boutique/BoutiqueCollectionGallery"

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

async function getAllCollections(): Promise<string[]> {
  const products = await client.fetch(
    `*[_type == "product" && (defined(collection) || defined(photo))]{ "collection": coalesce(collection->title, photo->collection->title) }`
  )
  return [...new Set<string>(products.map((p: any) => p.collection as string).filter(Boolean))]
}

async function getCollectionProducts(collectionName: string) {
  return client.fetch(
    `*[_type == "product" && coalesce(collection->title, photo->collection->title) == $col] | order(_createdAt asc) {
      _id, title, shortDescription,
      "image": coalesce(image, photo->image),
      gallery[]{ _key, asset },
      price, currency, formats[]{ name, price, stock },
      edition, "collection": coalesce(collection->title, photo->collection->title), paymentUrl, featured
    }`,
    { col: collectionName }
  )
}

export async function generateStaticParams() {
  const collections = await getAllCollections()
  return collections.map((c) => ({ slug: slugifyCollection(c) }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const collections = await getAllCollections()
  const name = matchCollection(slug, collections)
  if (!name) return {}
  return {
    title: name,
    description: `Tirages Fine Art — ${name}. Éditions numérotées, papier Hahnemühle, certificat d'authenticité.`,
  }
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params
  const collections = await getAllCollections()
  const collectionName = matchCollection(slug, collections)
  if (!collectionName) notFound()

  const products = await getCollectionProducts(collectionName)

  return (
    <>
      {/* Header */}
      <div className="pt-32 pb-12 px-6" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <div className="max-w-7xl mx-auto">
          <Link
            href="/boutique"
            className="text-xs uppercase mb-6 inline-flex items-center gap-2"
            style={{ color: "var(--color-muted)", letterSpacing: "0.15em" }}
          >
            ← Toutes les collections
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mt-4" style={{ color: "var(--color-text)" }}>
            {collectionName}
          </h1>
          <p className="mt-3 text-sm" style={{ color: "var(--color-muted)" }}>
            {products.length} tirage{products.length > 1 ? "s" : ""} disponible{products.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Products grid */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <BoutiqueCollectionGallery products={products} />
        </div>
      </section>
    </>
  )
}
