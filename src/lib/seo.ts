import type { Metadata } from "next"
import { LEGAL } from "@/lib/legal"
import { urlFor } from "@/lib/image"
import type { SanityImage } from "@/types/sanity"

/** URL publique du site (sans slash final). */
export const SITE_URL = LEGAL.website.replace(/\/$/, "")
export const SITE_NAME = LEGAL.brand

/** Identifiant stable de l'entreprise dans les données structurées. */
export const BUSINESS_ID = `${SITE_URL}/#entreprise`
export const PERSON_ID = `${SITE_URL}/#photographe`

/** Profils externes officiels (sameAs). Ajouter ici YouTube, Vimeo, etc. */
export const SOCIAL_PROFILES = ["https://www.instagram.com/carlito_laf/"]

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}

/** Image Sanity recadrée au format de partage (1200×630). */
export function ogImageUrl(image: SanityImage | null | undefined): string | undefined {
  const url = urlFor(image).width(1200).height(630).fit("crop").quality(85).url()
  return url || undefined
}

type PageMetaInput = {
  title?: string
  /** Titre complet, sans le suffixe « | Carlito Laf Visuel » */
  absoluteTitle?: string
  description?: string
  /** Chemin de la page, ex. "/portfolio/ocean" */
  path: string
  image?: SanityImage | null
  imageUrl?: string
  noIndex?: boolean
  /** URL canonique forcée (champ SEO Sanity) */
  canonical?: string
}

/**
 * Métadonnées complètes d'une page : canonique, Open Graph, carte Twitter, robots.
 * À utiliser partout : Next remplace (et ne fusionne pas) les objets openGraph / alternates du layout.
 */
export function pageMeta(input: PageMetaInput): Metadata {
  const image = input.imageUrl ?? ogImageUrl(input.image)
  const canonical = input.canonical || input.path
  const ogTitle = input.absoluteTitle ?? (input.title ? `${input.title} | ${SITE_NAME}` : undefined)
  return {
    ...(input.absoluteTitle ? { title: { absolute: input.absoluteTitle } } : input.title ? { title: input.title } : {}),
    ...(input.description ? { description: input.description } : {}),
    alternates: { canonical },
    openGraph: {
      siteName: SITE_NAME,
      locale: "fr_FR",
      type: "website",
      url: canonical,
      ...(ogTitle ? { title: ogTitle } : {}),
      ...(input.description ? { description: input.description } : {}),
      ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      ...(ogTitle ? { title: ogTitle } : {}),
      ...(input.description ? { description: input.description } : {}),
      ...(image ? { images: [image] } : {}),
    },
    ...(input.noIndex ? { robots: { index: false, follow: true } } : {}),
  }
}

type SeoFields = {
  metaTitle?: string
  metaDescription?: string
  canonicalUrl?: string
  noIndex?: boolean
  openGraphImage?: SanityImage
}

/** Métadonnées d'une page gérée dans Sanity (objet « SEO »). */
export function sanityPageMeta(
  seo: SeoFields | null | undefined,
  fallback: { title?: string; absoluteTitle?: string; description?: string; path: string; image?: SanityImage | null }
): Metadata {
  return pageMeta({
    // Le titre SEO reçoit le suffixe « | Carlito Laf Visuel » (comme avant)
    title: seo?.metaTitle || fallback.title,
    absoluteTitle: seo?.metaTitle ? undefined : fallback.absoluteTitle,
    description: seo?.metaDescription || fallback.description,
    path: fallback.path,
    image: seo?.openGraphImage?.asset ? seo.openGraphImage : fallback.image,
    noIndex: seo?.noIndex,
    canonical: seo?.canonicalUrl,
  })
}

/** Entreprise locale (photographe) — injectée sur toutes les pages via le layout. */
export function businessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["ProfessionalService", "LocalBusiness"],
        "@id": BUSINESS_ID,
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/icon-512.png`,
        image: `${SITE_URL}/icon-512.png`,
        description:
          "Photographe et vidéaste surf basé à Bidart, au Pays basque et dans les Landes : séances photo, vidéo et drone pour surfeurs de tous niveaux, du débutant au professionnel, et tirages Fine Art de paysages.",
        email: LEGAL.email,
        telephone: "+33 6 51 29 50 12",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Avenue de Biarritz",
          postalCode: "64210",
          addressLocality: "Bidart",
          addressRegion: "Nouvelle-Aquitaine",
          addressCountry: "FR",
        },
        geo: { "@type": "GeoCoordinates", latitude: 43.4372, longitude: -1.5925 },
        areaServed: [
          { "@type": "AdministrativeArea", name: "Pays basque" },
          { "@type": "AdministrativeArea", name: "Landes" },
          { "@type": "AdministrativeArea", name: "Pyrénées-Atlantiques" },
          { "@type": "City", name: "Biarritz" },
          { "@type": "City", name: "Bidart" },
          { "@type": "City", name: "Anglet" },
          { "@type": "City", name: "Hossegor" },
          { "@type": "City", name: "Capbreton" },
          { "@type": "AdministrativeArea", name: "Nouvelle-Aquitaine" },
          { "@type": "Country", name: "France" },
        ],
        founder: { "@id": PERSON_ID },
        knowsAbout: [
          "Photographie de surf",
          "Photographie de sports nautiques",
          "Photographie d'aventure",
          "Photographie de paysage",
          "Vidéo et film de marque",
          "Prise de vue par drone",
          "Tirages Fine Art",
        ],
        sameAs: SOCIAL_PROFILES,
      },
      {
        "@type": "Person",
        "@id": PERSON_ID,
        name: LEGAL.ownerName,
        alternateName: "Carlito Laf",
        jobTitle: "Photographe et vidéaste",
        worksFor: { "@id": BUSINESS_ID },
        url: SITE_URL,
        sameAs: SOCIAL_PROFILES,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#site`,
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: "fr-FR",
        publisher: { "@id": BUSINESS_ID },
      },
    ],
  }
}

/** Fil d'Ariane pour Google. items : [nom, chemin] dans l'ordre. */
export function breadcrumbJsonLd(items: [string, string][]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: absoluteUrl(path),
    })),
  }
}
