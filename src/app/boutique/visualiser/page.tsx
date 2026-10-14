import type { Metadata } from "next"
import { client } from "@/lib/sanity.client"
import type { Product } from "@/types/sanity"
import RoomVisualizer from "./RoomVisualizer"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Voir un tirage chez moi",
  description: "Importez une photo de votre pièce et visualisez un tirage Fine Art à taille réelle sur votre mur.",
}

const QUERY = `*[_type == "product" && defined(coalesce(image, photo->image))] | order(_createdAt asc) {
  _id, title, shortDescription,
  "image": coalesce(image, photo->image),
  gallery[]{ _key, asset },
  price, currency, formats[]{ name, price, stock },
  edition, "collection": coalesce(collection->title, photo->collection->title), paymentUrl, featured
}`

type Props = { searchParams: Promise<{ product?: string; format?: string }> }

export default async function VisualiserPage({ searchParams }: Props) {
  const [products, params] = await Promise.all([client.fetch<Product[]>(QUERY), searchParams])

  return (
    <>
      <div className="pt-32 pb-10 px-6 text-center" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <p className="font-mono-data text-xs uppercase mb-4" style={{ color: "var(--color-data)", letterSpacing: "0.18em" }}>
          Boutique · Essai virtuel
        </p>
        <h1 className="text-5xl md:text-6xl mb-4" style={{ color: "var(--color-text)" }}>
          Voir un tirage chez moi
        </h1>
        <p className="max-w-2xl mx-auto" style={{ color: "var(--color-muted)" }}>
          Prenez en photo le mur de votre pièce, choisissez un tirage et son format : il s’affiche à l’échelle,
          avec ou sans cadre. Votre photo reste sur votre appareil, elle n’est jamais envoyée sur internet.
        </p>
      </div>
      <RoomVisualizer products={products} initialProductId={params.product} initialFormat={params.format} />
    </>
  )
}
