import type { Metadata } from "next"
import Link from "next/link"
import { client } from "@/lib/sanity.client"
import { sortByManualOrder } from "@/lib/photoOrder"
import JsonLd from "@/components/seo/JsonLd"
import { pageMeta, breadcrumbJsonLd } from "@/lib/seo"
import type { SanityImage } from "@/types/sanity"
import {
  LandingHeader,
  LandingSection,
  CardGrid,
  PhotoStrip,
  Faq,
  faqJsonLd,
  FinalCta,
  type LandingPhoto,
} from "@/components/seo/Landing"

export const revalidate = 3600

const PATH = "/tirages-photo-paysage"
const TITLE = "Tirages photo de paysages : océan, montagne et lumières"
const DESCRIPTION =
  "Tirages photo de paysages en Fine Art Hahnemühle ou papier photo mat et brillant, du 20x30 au 70x105 cm. Océan, montagne, jungle et couchers de soleil. Livraison offerte en France."

/** Collections de paysages (slug Sanity → libellé affiché). */
const LANDSCAPE_COLLECTIONS = ["ocean-and-waves", "jungle-and-rocks", "sun-and-autumn", "winter-and-ice"]

type Collection = { _id: string; title: string; slug: string; description?: string; order: string[] | null }
type Photo = LandingPhoto & { collectionId: string; image?: SanityImage }
type Data = {
  collections: Collection[]
  photos: Photo[]
  formats: { key: string; price: number; range?: string }[] | null
}

async function getData(): Promise<Data> {
  return client.fetch(
    `{
      "collections": *[_type == "collection" && visible == true && slug.current in $slugs]{
        _id, title, "slug": slug.current, description, "order": photoOrder[]._ref
      },
      "photos": *[_type == "photo" && collection->slug.current in $slugs] | order(_createdAt asc) {
        _id, title, alt, image, "collectionId": collection._ref
      },
      "formats": *[_id == "tarifs.tirages"][0].formats[]{ key, price, range }
    }`,
    { slugs: LANDSCAPE_COLLECTIONS }
  )
}

/** Les deux premières photos (ordre manuel) de chaque collection de paysages. */
function pickPhotos(data: Data): LandingPhoto[] {
  const out: LandingPhoto[] = []
  for (const slug of LANDSCAPE_COLLECTIONS) {
    const c = data.collections.find((x) => x.slug === slug)
    if (!c) continue
    const own = sortByManualOrder(
      data.photos.filter((p) => p.collectionId === c._id),
      c.order
    )
    out.push(...own.slice(0, 2).map((p) => ({ ...p, href: `/portfolio/${c.slug}` })))
  }
  return out.slice(0, 6)
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getData()
  return pageMeta({ absoluteTitle: `${TITLE} | Carlito Laf Visuel`, description: DESCRIPTION, path: PATH, image: pickPhotos(data)[0]?.image })
}

const FAQ = [
  {
    q: "Sur quels papiers sont imprimés les tirages ?",
    a: "Deux gammes au choix : le papier Fine Art Hahnemühle, un papier d’art mat à la texture veloutée et aux noirs profonds, et le papier photo, en finition mate ou brillante, plus abordable.",
  },
  {
    q: "Quels formats sont disponibles ?",
    a: "Six formats au rapport 2:3, du 20x30 cm au 70x105 cm : 20x30, 30x45, 40x60, 50x75, 60x90 et 70x105 cm.",
  },
  {
    q: "Quels sont les délais et les frais de livraison ?",
    a: "La livraison est offerte en France métropolitaine. Les tirages sont imprimés et expédiés par mon laboratoire partenaire et arrivent sous 10 jours environ.",
  },
  {
    q: "Une photo du portfolio me plaît mais elle n’est pas dans la boutique, comment faire ?",
    a: "Ouvrez la photo dans le portfolio et cliquez sur « Je veux ce tirage » : je vous recontacte pour vous proposer le format et le papier qui conviennent.",
  },
  {
    q: "Comment savoir quel format choisir pour mon mur ?",
    a: "Utilisez l’essai virtuel « Voir un tirage chez moi » : vous importez une photo de votre pièce et vous visualisez le tirage à l’échelle avant de commander.",
  },
]

export default async function PrintsLandingPage() {
  const data = await getData()
  const strip = pickPhotos(data)
  const min = (range: string) => {
    const prices = (data.formats ?? []).filter((f) => (f.range ?? "fineart") === range).map((f) => f.price)
    return prices.length ? Math.min(...prices) : undefined
  }
  const minFine = min("fineart")
  const minPhoto = min("photo")
  const collections = LANDSCAPE_COLLECTIONS.map((s) => data.collections.find((c) => c.slug === s)).filter(Boolean) as Collection[]

  return (
    <>
      <JsonLd
        data={[
          faqJsonLd(FAQ),
          breadcrumbJsonLd([
            ["Accueil", "/"],
            ["Boutique", "/boutique"],
            ["Tirages photo de paysages", PATH],
          ]),
        ]}
      />

      <LandingHeader
        crumbs={[
          ["Accueil", "/"],
          ["Boutique", "/boutique"],
          ["Tirages paysage", PATH],
        ]}
        eyebrow="Fine Art · Papier photo — Livraison offerte"
        title={TITLE}
        lead={
          <>
            <p>
              Vagues de tempête, plages vues du ciel, sommets enneigés, jungles et couchers de soleil : mes photos de
              paysages, prises entre le Pays basque, les Landes et mes voyages, sont disponibles en tirages d’art pour
              habiller votre intérieur.
            </p>
            <p>
              Chaque tirage est imprimé sur <strong>papier Fine Art Hahnemühle</strong>
              {minFine ? ` (dès ${minFine} €)` : ""} ou sur <strong>papier photo mat ou brillant</strong>
              {minPhoto ? ` (dès ${minPhoto} €)` : ""}, du 20x30 au 70x105 cm, et livré gratuitement en France
              métropolitaine.
            </p>
          </>
        }
        actions={[
          { href: "/boutique", label: "Voir la boutique", primary: true },
          { href: "/boutique/visualiser", label: "Voir un tirage chez moi" },
        ]}
      />

      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <PhotoStrip photos={strip} defaultHref="/portfolio" />
        </div>
      </section>

      {collections.length > 0 && (
        <LandingSection alt title="Les collections de paysages">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {collections.map((c) => (
              <div key={c._id} className="rounded-2xl p-6" style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
                <h3 className="text-2xl" style={{ color: "var(--color-accent)" }}>
                  {c.title}
                </h3>
                {c.description && (
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>
                    {c.description}
                  </p>
                )}
                <Link href={`/portfolio/${c.slug}`} className="inline-block mt-4 text-xs uppercase" style={{ color: "var(--color-accent)", letterSpacing: "0.15em" }}>
                  Voir la collection →
                </Link>
              </div>
            ))}
          </div>
        </LandingSection>
      )}

      <LandingSection title="Deux gammes de papier">
        <CardGrid
          items={[
            {
              title: "Fine Art Hahnemühle",
              text: (
                <p>
                  Papier d’art mat de référence, texture veloutée, noirs profonds et grande longévité. Le choix des
                  collectionneurs pour les grands formats.{minFine ? ` À partir de ${minFine} € en 20x30.` : ""}
                </p>
              ),
            },
            {
              title: "Papier photo",
              text: (
                <p>
                  Finition mate ou brillante, couleurs éclatantes et prix doux : idéal pour offrir ou pour composer un mur
                  de plusieurs images.{minPhoto ? ` À partir de ${minPhoto} € en 20x30.` : ""}
                </p>
              ),
            },
            {
              title: "Essai à la maison",
              text: <p>Avant de commander, visualisez le tirage à l’échelle sur une photo de votre mur grâce à l’essai virtuel.</p>,
              href: "/boutique/visualiser",
              linkLabel: "Voir un tirage chez moi",
            },
          ]}
        />
      </LandingSection>

      <LandingSection alt title="Questions fréquentes">
        <Faq items={FAQ} />
        <p className="mt-8 text-sm" style={{ color: "var(--color-muted)" }}>
          Vous surfez ? Je propose aussi des{" "}
          <Link href="/photographe-surf-pays-basque-landes" className="underline" style={{ color: "var(--color-accent)" }}>
            séances photo et vidéo de surf au Pays basque et dans les Landes
          </Link>
          . Conditions de vente :{" "}
          <Link href="/cgv" className="underline" style={{ color: "var(--color-accent)" }}>
            CGV
          </Link>
          .
        </p>
      </LandingSection>

      <FinalCta
        title="Un paysage pour votre mur"
        text="Parcourez la boutique ou demandez le tirage de n’importe quelle photo du portfolio."
        href="/boutique"
        label="Voir la boutique"
      />
    </>
  )
}
