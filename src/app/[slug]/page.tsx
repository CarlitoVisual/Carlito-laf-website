import { client } from "@/lib/sanity.client"
import { pageQuery, allSlugsQuery } from "@/lib/queries"
import PageBuilder from "@/components/PageBuilder"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

export const revalidate = 60

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await client.fetch(allSlugsQuery)
  return slugs
    .filter((s: any) => s.slug !== "accueil")
    .map((s: any) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await client.fetch(pageQuery, { slug })
  if (!page) return {}
  return {
    title: page.seo?.metaTitle || page.title,
    description: page.seo?.metaDescription,
  }
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params
  const page = await client.fetch(pageQuery, { slug })

  if (!page) notFound()

  return <PageBuilder sections={page.sections ?? []} />
}
