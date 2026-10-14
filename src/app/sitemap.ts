import type { MetadataRoute } from "next"
import { client } from "@/lib/sanity.client"
import { slugifyCollection } from "@/lib/shop"
import { absoluteUrl } from "@/lib/seo"

export const revalidate = 3600

type Entry = { slug?: string; updatedAt?: string; noIndex?: boolean }
type ProductEntry = { collection?: string; updatedAt?: string }

const SITEMAP_QUERY = `{
  "pages": *[_type == "page" && defined(slug.current)]{ "slug": slug.current, "updatedAt": _updatedAt, "noIndex": seo.noIndex },
  "collections": *[_type == "collection" && visible == true && defined(slug.current)]{ "slug": slug.current, "updatedAt": _updatedAt },
  "services": *[_type == "service" && defined(slug.current)]{ "slug": slug.current, "updatedAt": _updatedAt },
  "products": *[_type == "product" && (defined(collection) || defined(photo))]{
    "collection": coalesce(collection->title, photo->collection->title), "updatedAt": _updatedAt
  }
}`

/** Plan du site pour Google : généré automatiquement depuis Sanity (rafraîchi toutes les heures). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await client.fetch<{
    pages: Entry[]
    collections: Entry[]
    services: Entry[]
    products: ProductEntry[]
  }>(SITEMAP_QUERY)

  const entry = (
    path: string,
    updatedAt: string | undefined,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "monthly"
  ): MetadataRoute.Sitemap[number] => ({
    url: absoluteUrl(path),
    lastModified: updatedAt ? new Date(updatedAt) : undefined,
    changeFrequency,
    priority,
  })

  const home = data.pages.find((p) => p.slug === "accueil")

  const staticRoutes: MetadataRoute.Sitemap = [
    entry("/", home?.updatedAt, 1, "weekly"),
    entry("/portfolio", undefined, 0.9, "weekly"),
    entry("/boutique", undefined, 0.9, "weekly"),
    entry("/devis", undefined, 0.8),
    entry("/boutique/visualiser", undefined, 0.5),
    entry("/mentions-legales", undefined, 0.1, "yearly"),
    entry("/confidentialite", undefined, 0.1, "yearly"),
    entry("/cgu", undefined, 0.1, "yearly"),
    entry("/cgv", undefined, 0.1, "yearly"),
    entry("/remboursement", undefined, 0.1, "yearly"),
    entry("/retractation", undefined, 0.1, "yearly"),
  ]

  const pages = data.pages
    .filter((p) => p.slug && p.slug !== "accueil" && !p.noIndex)
    .map((p) => entry(`/${p.slug}`, p.updatedAt, 0.7))

  const collections = data.collections.map((c) => entry(`/portfolio/${c.slug}`, c.updatedAt, 0.8))

  const services = data.services.map((s) => entry(`/prestations/${s.slug}`, s.updatedAt, 0.8))

  // Collections de la boutique : date = dernier produit modifié
  const shop = new Map<string, string | undefined>()
  for (const p of data.products) {
    if (!p.collection) continue
    const prev = shop.get(p.collection)
    if (!prev || (p.updatedAt && p.updatedAt > prev)) shop.set(p.collection, p.updatedAt)
  }
  const shopCollections = [...shop].map(([name, updatedAt]) =>
    entry(`/boutique/${slugifyCollection(name)}`, updatedAt, 0.8, "weekly")
  )

  // Une page Sanity peut porter le slug d'une route du site (« portfolio », « boutique ») : on garde une seule entrée par URL
  const seen = new Set<string>()
  return [...staticRoutes, ...pages, ...collections, ...services, ...shopCollections].filter((e) => {
    if (seen.has(e.url)) return false
    seen.add(e.url)
    return true
  })
}
