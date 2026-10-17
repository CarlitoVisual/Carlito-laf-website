import type { Metadata } from "next"
import Link from "next/link"
import { client } from "@/lib/sanity.client"
import { sortByManualOrder } from "@/lib/photoOrder"
import JsonLd from "@/components/seo/JsonLd"
import { pageMeta, breadcrumbJsonLd, absoluteUrl, BUSINESS_ID } from "@/lib/seo"
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

const PATH = "/photographe-surf-pays-basque-landes"
const TITLE = "Photographe & vidéaste surf au Pays basque et dans les Landes"
const DESCRIPTION =
  "Séances photo et vidéo de surf à Biarritz, Bidart, Anglet, Guéthary, Hossegor, Seignosse ou Capbreton. Pour tous les niveaux : souvenirs de vos premières vagues ou book pro. Devis gratuit."

type Duration = { key: string; label: string; price: number; includedRetouches?: number }
type Data = {
  photos: (LandingPhoto & { image?: LandingPhoto["image"] })[]
  order: string[] | null
  grid: { durations?: Duration[]; comboPct?: number; commercialPct?: number; freeKm?: number } | null
}

async function getData(): Promise<Data> {
  return client.fetch(`{
    "order": *[_type == "collection" && slug.current == "surf"][0].photoOrder[]._ref,
    "photos": *[_type == "photo" && collection->slug.current == "surf"] | order(_createdAt asc) { _id, title, alt, image },
    "grid": *[_type == "priceGrid"][0]{ durations[]{ key, label, price, includedRetouches }, comboPct, commercialPct, freeKm }
  }`)
}

export async function generateMetadata(): Promise<Metadata> {
  const { photos, order } = await getData()
  const cover = sortByManualOrder(photos, order)[0]?.image
  return pageMeta({ absoluteTitle: `${TITLE} | Carlito Laf Visuel`, description: DESCRIPTION, path: PATH, image: cover })
}

const FAQ = [
  {
    q: "Je débute le surf, une séance photo a-t-elle un intérêt ?",
    a: "Oui ! Beaucoup de surfeurs n’ont aucune image de leurs premières vagues. Une séance d’une heure pendant un cours ou une session entre amis suffit pour repartir avec de beaux souvenirs, et les photos aident aussi à voir sa position sur la planche pour progresser.",
  },
  {
    q: "Sur quels spots vous déplacez-vous ?",
    a: "Je suis basé à Bidart et je couvre toute la côte basque (Biarritz, Anglet, Guéthary, Saint-Jean-de-Luz, Hendaye) et la côte landaise (Hossegor, Seignosse, Capbreton, Labenne, Vieux-Boucau, Moliets). Les déplacements sont inclus jusqu’à 30 km de Bidart ; au-delà, des frais kilométriques sont ajoutés au devis. Je me déplace aussi partout en France sur devis.",
  },
  {
    q: "Que se passe-t-il si les conditions ne sont pas bonnes le jour J ?",
    a: "On choisit le créneau ensemble en fonction des prévisions de houle, de vent et de marée. Si l’océan ne joue pas le jeu, on convient d’une autre date.",
  },
  {
    q: "Combien de photos vais-je recevoir ?",
    a: "Le nombre de photos retouchées incluses dépend de la durée : 15 pour une heure, 30 pour deux heures, 50 pour une demi-journée et 100 pour une journée. Des photos supplémentaires peuvent être ajoutées à l’unité.",
  },
  {
    q: "Proposez-vous aussi la vidéo et le drone ?",
    a: "Oui. Je peux filmer votre session depuis la plage, avec une caméra d’action dans l’eau ou au drone, et monter un clip pour les réseaux sociaux ou un film court. Photo et vidéo peuvent être combinées sur la même séance.",
  },
  {
    q: "Je suis surfeur pro ou une marque : pouvez-vous réaliser un book ou des images pour mes sponsors ?",
    a: "Oui, je réalise des books, des contenus pour les sponsors, des images de compétition et des campagnes pour les écoles de surf et les marques. L’usage commercial des images est précisé dans le devis.",
  },
]

const SPOTS_BASQUE = ["Bidart", "Biarritz (Côte des Basques, Grande Plage, Marbella)", "Anglet", "Guéthary (Parlementia)", "Saint-Jean-de-Luz", "Hendaye"]
const SPOTS_LANDES = ["Hossegor (La Nord, La Gravière)", "Seignosse", "Capbreton", "Labenne", "Vieux-Boucau", "Moliets"]

export default async function SurfLandingPage() {
  const { photos, order, grid } = await getData()
  const strip = sortByManualOrder(photos, order).slice(0, 6)
  const durations = (grid?.durations ?? []).filter((d) => d.key !== "week")
  const minPrice = durations.length ? Math.min(...durations.map((d) => d.price)) : undefined
  const freeKm = grid?.freeKm ?? 30

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${absoluteUrl(PATH)}#service`,
    name: "Photographie et vidéo de surf",
    serviceType: "Photographe et vidéaste surf",
    description: DESCRIPTION,
    url: absoluteUrl(PATH),
    provider: { "@id": BUSINESS_ID },
    areaServed: [
      { "@type": "AdministrativeArea", name: "Pays basque" },
      { "@type": "AdministrativeArea", name: "Landes" },
    ],
    audience: { "@type": "Audience", audienceType: "Surfeurs débutants, confirmés et professionnels, écoles de surf, marques" },
    ...(minPrice
      ? { offers: { "@type": "Offer", price: minPrice, priceCurrency: "EUR", description: "Séance photo surf d’une heure, à partir de", url: absoluteUrl("/devis") } }
      : {}),
  }

  return (
    <>
      <JsonLd
        data={[
          serviceLd,
          faqJsonLd(FAQ),
          breadcrumbJsonLd([
            ["Accueil", "/"],
            ["Prestations", "/prestations"],
            ["Photographe surf Pays basque & Landes", PATH],
          ]),
        ]}
      />

      <LandingHeader
        crumbs={[
          ["Accueil", "/"],
          ["Prestations", "/prestations"],
          ["Photographe surf", PATH],
        ]}
        eyebrow="Photo · Vidéo · Drone — Pays basque & Landes"
        title={TITLE}
        lead={
          <>
            <p>
              Basé à Bidart, je photographie et je filme les surfeurs sur toute la côte, de Hendaye à Hossegor. Que vous
              preniez vos premières vagues en école de surf ou que vous prépariez votre saison de compétition, je capte vos
              sessions au téléobjectif depuis la plage, dans l’eau ou au drone.
            </p>
            <p>
              Du <strong>débutant qui veut garder un souvenir de ses premières vagues</strong> au{" "}
              <strong>professionnel qui a besoin d’un book</strong>, chaque séance s’adapte à votre niveau, au spot et aux
              conditions du jour.
            </p>
          </>
        }
        actions={[
          { href: "/devis", label: "Demander un devis gratuit", primary: true },
          { href: "/portfolio/surf", label: "Voir le portfolio surf" },
        ]}
      />

      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <PhotoStrip photos={strip} defaultHref="/portfolio/surf" />
        </div>
      </section>

      <LandingSection
        alt
        title="Une séance pour chaque surfeur"
        intro={<p>Pas besoin de surfer La Nord un jour de grosse houle pour mériter de belles images : je photographie tous les niveaux, sur tous types de vagues.</p>}
      >
        <CardGrid
          items={[
            {
              title: "Débutants",
              text: (
                <p>
                  Vos premières vagues, pendant un cours de surf, des vacances au Pays basque ou dans les Landes, ou une
                  session en famille. Une heure suffit pour repartir avec des souvenirs que vous ne pourrez pas prendre
                  vous-même depuis l’eau.
                </p>
              ),
            },
            {
              title: "Surfeurs confirmés",
              text: (
                <p>
                  Des images de vos meilleures manœuvres pour vos réseaux sociaux, et des séquences vidéo pour analyser
                  votre surf : take-off, bottom turn, position dans le tube…
                </p>
              ),
            },
            {
              title: "Pros & compétiteurs",
              text: (
                <p>
                  Un book pour vos sponsors, des images de compétition, des contenus pour une marque ou une école de surf.
                  Photo, vidéo et drone combinés, avec usage commercial des images.
                </p>
              ),
            },
          ]}
        />
      </LandingSection>

      <LandingSection title="Photo, vidéo et drone : ce que je propose">
        <CardGrid
          items={[
            {
              title: "Photo de surf",
              text: <p>Prises de vue au téléobjectif depuis la plage ou les rochers, et photos retouchées livrées en haute définition.</p>,
              href: "/prestations/photoshoot-sport-prive",
              linkLabel: "Photoshoot sport privé",
            },
            {
              title: "Vidéo & montage",
              text: <p>Votre session filmée depuis la plage ou avec une caméra d’action dans l’eau, montée en clip pour les réseaux sociaux ou en film court.</p>,
              href: "/prestations/montage-reseaux-sociaux",
              linkLabel: "Montage réseaux sociaux",
            },
            {
              title: "Drone",
              text: <p>Des plans aériens du spot et de vos vagues pour donner une autre dimension à votre session ou à votre film.</p>,
              href: "/prestations/plan-drone",
              linkLabel: "Plan drone",
            },
          ]}
        />
      </LandingSection>

      <LandingSection
        alt
        title="Les spots du Pays basque et des Landes"
        intro={
          <p>
            On choisit ensemble le spot selon votre niveau, la houle, le vent et la marée. Déplacements inclus jusqu’à{" "}
            {freeKm} km de Bidart, puis frais kilométriques au-delà. Je me déplace aussi partout en France sur devis.
          </p>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            ["Côte basque", SPOTS_BASQUE],
            ["Côte landaise", SPOTS_LANDES],
          ].map(([label, spots]) => (
            <div key={label as string}>
              <h3 className="text-2xl mb-4" style={{ color: "var(--color-accent)" }}>
                {label as string}
              </h3>
              <ul className="space-y-2" style={{ color: "var(--color-text)" }}>
                {(spots as string[]).map((s) => (
                  <li key={s}>· {s}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </LandingSection>

      <LandingSection title="Comment se déroule une séance">
        <ol className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[
            ["Votre demande", "Vous décrivez votre projet dans le formulaire de devis : niveau, dates, spot souhaité, photo et/ou vidéo."],
            ["Le bon créneau", "Je vous propose un créneau selon les prévisions de houle, de vent, de marée et la plus belle lumière."],
            ["La session", "Vous surfez, je shoote. Pas besoin de poser : je m’adapte à votre surf et aux conditions."],
            ["Vos images", "Je sélectionne et je retouche les meilleures photos, puis je vous les envoie en haute définition."],
          ].map(([t, d], i) => (
            <li key={t} className="rounded-2xl p-6" style={{ border: "1px solid var(--color-border)" }}>
              <span className="font-mono-data text-sm" style={{ color: "var(--color-data)" }}>
                0{i + 1}
              </span>
              <h3 className="text-xl mt-2" style={{ color: "var(--color-text)" }}>
                {t}
              </h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
                {d}
              </p>
            </li>
          ))}
        </ol>
      </LandingSection>

      {durations.length > 0 && (
        <LandingSection
          alt
          title="Tarifs indicatifs"
          intro={
            <p>
              Prix pour une séance photo, retouches incluses. Photo + vidéo : +{grid?.comboPct ?? 50} %. Usage commercial
              (marques, sponsors) : +{grid?.commercialPct ?? 40} %. Le devis final tient compte des options (drone, caméra
              dans l’eau, montage) et du déplacement.
            </p>
          }
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {durations.map((d) => (
              <div key={d.key} className="rounded-2xl p-5 text-center" style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
                <p className="text-sm uppercase" style={{ color: "var(--color-muted)", letterSpacing: "0.1em" }}>
                  {d.label}
                </p>
                <p className="font-display text-4xl font-black mt-2" style={{ color: "var(--color-accent)" }}>
                  {d.price} €
                </p>
                {d.includedRetouches ? (
                  <p className="text-xs mt-2" style={{ color: "var(--color-muted)" }}>
                    {d.includedRetouches} photos retouchées
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </LandingSection>
      )}

      <LandingSection title="Questions fréquentes">
        <Faq items={FAQ} />
        <p className="mt-8 text-sm" style={{ color: "var(--color-muted)" }}>
          Envie d’un tirage d’une vague ou d’un paysage de la côte ? Découvrez aussi mes{" "}
          <Link href="/tirages-photo-paysage" className="underline" style={{ color: "var(--color-accent)" }}>
            tirages photo de paysages
          </Link>
          .
        </p>
      </LandingSection>

      <FinalCta
        title="On va à l’eau ?"
        text="Dites-moi votre niveau, vos dates et le spot qui vous fait rêver : je vous réponds avec un devis gratuit."
        href="/devis"
        label="Demander un devis"
      />
    </>
  )
}
