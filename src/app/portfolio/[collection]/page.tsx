import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { client } from "@/lib/sanity.client"
import { urlFor } from "@/lib/image"
import CollectionGallery, { type GalleryPhoto } from "@/components/portfolio/CollectionGallery"

export const revalidate = 60

type Props = { params: Promise<{ collection: string }> }

type CollectionDoc = { _id: string; title: string; slug: string }

async function getAllCollectionDocs(): Promise<CollectionDoc[]> {
  return client.fetch(`*[_type == "collection" && visible == true]{ _id, title, "slug": slug.current }`)
}

async function getCollectionBySlug(slug: string): Promise<CollectionDoc | undefined> {
  const docs = await getAllCollectionDocs()
  return docs.find((c) => c.slug === slug)
}

async function getCollectionPhotos(collectionId: string): Promise<GalleryPhoto[]> {
  const raw = await client.fetch(
    `*[_type == "photo" && collection._ref == $id] | order(_createdAt asc) {
      _id, title, alt, image, location,
      availableAsPrint,
      "productSlug": product->slug.current
    }`,
    { id: collectionId }
  )

  return raw
    .map((p: any) => {
      const ref: string = p.image?.asset?._ref ?? ""
      const match = ref.match(/-(\d+)x(\d+)-/)
      const width = match ? parseInt(match[1]) : 900
      const height = match ? parseInt(match[2]) : 600
      const src = urlFor(p.image).width(800).quality(85).url()
      const srcFull = urlFor(p.image).width(1800).quality(90).url()
      if (!src || !srcFull) return null
      return {
        _id: p._id,
        title: p.title,
        alt: p.alt,
        src,
        srcFull,
        width,
        height,
        location: p.location,
        availableAsPrint: p.availableAsPrint ?? false,
        productSlug: p.productSlug,
      } satisfies GalleryPhoto
    })
    .filter(Boolean) as GalleryPhoto[]
}

export async function generateStaticParams() {
  const docs = await getAllCollectionDocs()
  return docs.map((c) => ({ collection: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection: slug } = await params
  const doc = await getCollectionBySlug(slug)
  if (!doc) return {}
  return {
    title: `${doc.title} — Portfolio`,
    description: `Collection photo ${doc.title} par Carlito Laf Visuel.`,
  }
}

export default async function CollectionPage({ params }: Props) {
  const { collection: slug } = await params
  const doc = await getCollectionBySlug(slug)
  if (!doc) notFound()

  const photos = await getCollectionPhotos(doc._id)

  return (
    <>
      {/* Header */}
      <div className="pt-32 pb-12 px-6" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <div className="max-w-7xl mx-auto">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-xs uppercase mb-6"
            style={{ color: "var(--color-muted)", letterSpacing: "0.15em" }}
          >
            ← Toutes les collections
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mt-4" style={{ color: "var(--color-text)" }}>
            {doc.title}
          </h1>
          <p className="mt-3 text-sm" style={{ color: "var(--color-muted)" }}>
            {photos.length} photo{photos.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Gallery */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <CollectionGallery photos={photos} />
        </div>
      </section>

      {/* Footer nav */}
      <div className="py-12 px-6 text-center" style={{ borderTop: "1px solid var(--color-border)" }}>
        <Link href="/portfolio" className="text-xs uppercase" style={{ color: "var(--color-muted)", letterSpacing: "0.2em" }}>
          ← Retour aux collections
        </Link>
      </div>
    </>
  )
}
