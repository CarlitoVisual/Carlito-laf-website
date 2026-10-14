import { client } from "@/lib/sanity.client"
import { pageQuery, allSlugsQuery } from "@/lib/queries"
import PageBuilder from "@/components/PageBuilder"
import PageShell from "@/components/PageShell"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { sanityPageMeta } from "@/lib/seo"

export const revalidate = 60

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(allSlugsQuery)
  return slugs
    .filter((s) => s.slug !== "accueil")
    .map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await client.fetch(pageQuery, { slug })
  if (!page) return {}
  const hero = page.sections?.find((s: { _type?: string }) => s._type === "hero")
  return sanityPageMeta(page.seo, {
    title: page.title,
    path: `/${slug}`,
    image: hero?.image ?? hero?.videoPoster,
  })
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params
  const page = await client.fetch(pageQuery, { slug })

  if (!page) notFound()

  return (
    <PageShell backgroundVideo={page.backgroundVideo}>
      <PageBuilder sections={page.sections ?? []} />
    </PageShell>
  )
}
