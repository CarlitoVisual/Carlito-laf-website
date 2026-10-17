import { client } from "@/lib/sanity.client"
import { pageQuery } from "@/lib/queries"
import PageBuilder from "@/components/PageBuilder"
import PageShell from "@/components/PageShell"
import VideoIntroWrapper from "@/components/VideoIntroWrapper"
import { urlFor } from "@/lib/image"
import { sanityPageMeta } from "@/lib/seo"
import type { Metadata } from "next"
import HomeSeoIntro from "@/components/seo/HomeSeoIntro"

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const page = await client.fetch(pageQuery, { slug: "accueil" })
  const hero = page?.sections?.[0]
  return sanityPageMeta(page?.seo, {
    absoluteTitle: "Photographe & vidéaste surf au Pays basque et dans les Landes | Carlito Laf Visuel",
    description:
      "Photographe et vidéaste surf basé à Bidart : séances photo, vidéo et drone pour tous les niveaux, de Biarritz à Hossegor. Tirages Fine Art de paysages, livraison offerte.",
    path: "/",
    image: hero?._type === "hero" ? (hero.image ?? hero.videoPoster) : undefined,
  })
}

export default async function Home() {
  const page = await client.fetch(pageQuery, { slug: "accueil" })

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text)" }}>
            Page d&apos;accueil introuvable
          </h1>
          <p style={{ color: "var(--color-muted)" }}>
            Créez une page avec le slug &ldquo;accueil&rdquo; dans Sanity Studio.
          </p>
        </div>
      </div>
    )
  }

  const sections = page.sections ?? []

  // Detect video hero as first section
  const firstSection = sections[0]
  const isVideoHero =
    firstSection?._type === "hero" &&
    (firstSection.mediaType === "video" || firstSection.mediaType === "videoUrl")

  let videoUrl: string | undefined
  let posterUrl: string | undefined

  if (isVideoHero) {
    if (firstSection.mediaType === "video" && firstSection.videoFile?.asset?.url) {
      videoUrl = firstSection.videoFile.asset.url
    } else if (firstSection.mediaType === "videoUrl" && firstSection.videoUrl) {
      // For Vimeo/YouTube we fall back to image hero (no embed in VideoIntro)
      videoUrl = undefined
    }
    if (firstSection.videoPoster) {
      posterUrl = urlFor(firstSection.videoPoster).width(1920).quality(80).url()
    }
  }

  // Sections to pass to PageBuilder (skip first if we handle it as VideoIntro)
  const remainingSections = videoUrl ? sections.slice(1) : sections

  return (
    <PageShell backgroundVideo={page.backgroundVideo}>
      {/* Titre principal pour Google et les lecteurs d’écran (l’intro vidéo n’est rendue que côté navigateur) */}
      {videoUrl && <h1 className="sr-only">Photographe et vidéaste surf au Pays basque et dans les Landes</h1>}
      {videoUrl && (
        <VideoIntroWrapper
          videoUrl={videoUrl}
          posterUrl={posterUrl}
          title={firstSection.title}
          subtitle={firstSection.subtitle}
        />
      )}
      {remainingSections.length > 0 && (
        <div style={{ paddingTop: videoUrl ? 0 : 0 }}>
          <PageBuilder sections={remainingSections} />
        </div>
      )}
      <HomeSeoIntro />
    </PageShell>
  )
}
