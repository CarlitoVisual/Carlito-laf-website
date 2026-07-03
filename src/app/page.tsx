import { client } from "@/lib/sanity.client"
import { pageQuery } from "@/lib/queries"
import PageBuilder from "@/components/PageBuilder"
import VideoIntroWrapper from "@/components/VideoIntroWrapper"
import { urlFor } from "@/lib/image"

export const revalidate = 60

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
    <>
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
    </>
  )
}
