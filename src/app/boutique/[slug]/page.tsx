import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { client } from "@/lib/sanity.client"
import { slugifyCollection, matchCollection } from "@/lib/shop"
import BoutiqueCollectionGallery from "@/components/boutique/BoutiqueCollectionGallery"
import TryAtHomeBanner from "@/components/boutique/TryAtHomeBanner"
import JsonLd from "@/components/seo/JsonLd"
import { pageMeta, absoluteUrl, breadcrumbJsonLd, BUSINESS_ID, SITE_NAME } from "@/lib/seo"
import { urlFor } from "@/lib/image"
import { isFormatAvailable } from "@/lib/shop"
import type { Product } from "@/types/sanity"

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

async function getAllCollections(): Promise<string[]> {
  const products = await client.fetch<{ collection?: string }[]>(
    `*[_type == "product" && (defined(collection) || defined(photo))]{ "collection": coalesce(collection->title, photo->collection->title) }`
  )
  return [...new Set<string>(products.map((p) => p.collection).filter((c): c is string => Boolean(c)))]
}

async function getCollectionProducts(collectionName: string): Promise<Product[]> {
  return client.fetch(
    `*[_type == "product" && coalesce(collection->title, photo->collection->title) == $col] | order(_createdAt asc) {
      _id, title, shortDescription,
      "image": coalesce(image, photo->image),
      gallery[]{ _key, asset },
      price, currency, formats[]{ name, price, stock },
      "collection": coalesce(collection->title, photo->collection->title), paymentUrl, featured
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
  const products = await getCollectionProducts(name)
  return pageMeta({
    title: `${name} — Tirages Fine Art`,
    description: `Tirages photo Fine Art — ${name}. Papier Hahnemühle, imprimés à la demande par un laboratoire professionnel.`,
    path: `/boutique/${slug}`,
    image: products.find((p) => p.image?.asset)?.image,
  })
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params
  const collections = await getAllCollections()
  const collectionName = matchCollection(slug, collections)
  if (!collectionName) notFound()

  const products = await getCollectionProducts(collectionName)

  const pageUrl = absoluteUrl(`/boutique/${slug}`)
  const productsLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${collectionName} — Tirages Fine Art`,
    url: pageUrl,
    itemListElement: products.map((p, i) => {
      const priced = (p.formats ?? []).filter((f) => typeof f.price === "number")
      const prices = priced.length ? priced.map((f) => f.price as number) : p.price ? [p.price] : []
      const inStock = p.formats?.length ? p.formats.some(isFormatAvailable) : true
      const image = urlFor(p.image).width(1600).quality(85).url()
      const availability = inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          "@id": `${pageUrl}#${p._id}`,
          name: p.title,
          url: pageUrl,
          ...(image ? { image } : {}),
          ...(p.shortDescription ? { description: p.shortDescription } : {}),
          category: "Tirage photo Fine Art",
          brand: { "@type": "Brand", name: SITE_NAME },
          ...(prices.length
            ? {
                offers:
                  prices.length > 1
                    ? {
                        "@type": "AggregateOffer",
                        priceCurrency: p.currency || "EUR",
                        lowPrice: Math.min(...prices),
                        highPrice: Math.max(...prices),
                        offerCount: prices.length,
                        availability,
                        seller: { "@id": BUSINESS_ID },
                      }
                    : {
                        "@type": "Offer",
                        priceCurrency: p.currency || "EUR",
                        price: prices[0],
                        availability,
                        url: pageUrl,
                        seller: { "@id": BUSINESS_ID },
                      },
              }
            : {}),
        },
      }
    }),
  }

  return (
    <>
      <JsonLd
        data={[
          productsLd,
          breadcrumbJsonLd([
            ["Accueil", "/"],
            ["Boutique", "/boutique"],
            [collectionName, `/boutique/${slug}`],
          ]),
        ]}
      />
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

      <TryAtHomeBanner compact />

      {/* Products grid */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <BoutiqueCollectionGallery products={products} />
        </div>
      </section>
    </>
  )
}
