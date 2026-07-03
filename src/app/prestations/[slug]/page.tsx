import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { client } from "@/lib/sanity.client"
import { urlFor } from "@/lib/image"

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

const SERVICE_QUERY = `
*[_type == "service" && slug.current == $slug][0] {
  title, "slug": slug.current, category, shortDescription,
  description, coverImage, gallery[]{ _key, asset },
  deliverables, process[]{ title, description },
  priceType, price, currency, featured,
  videoExample {
    videoType, url,
    "fileUrl": file.asset->url,
    poster
  },
  projects[]-> {
    _id, title, "slug": slug.current, coverImage, excerpt, location, date, category
  }
}
`

const ALL_SLUGS_QUERY = `*[_type == "service" && defined(slug.current)]{ "slug": slug.current }`

export async function generateStaticParams() {
  const services = await client.fetch(ALL_SLUGS_QUERY)
  return services.map((s: any) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const service = await client.fetch(SERVICE_QUERY, { slug })
  if (!service) return {}
  return {
    title: service.title,
    description: service.shortDescription ?? undefined,
  }
}

function embedUrl(video: any): string | null {
  if (!video?.url) return null
  const url = video.url
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=0&title=0&byline=0&portrait=0`
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  return null
}

function priceLabel(s: any): string | null {
  if (!s.price) return null
  const curr = s.currency === "EUR" ? "€" : (s.currency ?? "€")
  if (s.priceType === "starting") return `À partir de ${s.price}${curr}`
  if (s.priceType === "fixed") return `${s.price}${curr}`
  return null
}

const CATEGORY_LABELS: Record<string, string> = {
  photo: "Photographie",
  video: "Production vidéo",
  "brand-film": "Film de marque",
  watersport: "Sport nautique",
  expedition: "Expédition",
  print: "Tirage Fine Art",
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params
  const service = await client.fetch(SERVICE_QUERY, { slug })
  if (!service) notFound()

  const label = priceLabel(service)
  const categoryLabel = service.category ? (CATEGORY_LABELS[service.category] ?? service.category) : null

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────── */}
      <div style={{ position: "relative", height: "75vh", minHeight: 480, background: "var(--color-bg)" }}>
        {service.coverImage && (
          <Image
            src={urlFor(service.coverImage).width(1600).quality(88).url()}
            alt={service.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        )}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)",
        }} />
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "0 6vw 56px",
          maxWidth: 900,
        }}>
          {categoryLabel && (
            <p style={{ color: "var(--color-accent)", fontSize: "0.7rem", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 14 }}>
              {categoryLabel}
            </p>
          )}
          <h1 style={{ color: "#fff", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: 16 }}>
            {service.title}
          </h1>
          {service.shortDescription && (
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.05rem", lineHeight: 1.7, maxWidth: 560 }}>
              {service.shortDescription}
            </p>
          )}
        </div>
        {/* Back link */}
        <Link
          href="/prestations"
          style={{
            position: "absolute", top: 100, left: "6vw",
            color: "rgba(255,255,255,0.6)", fontSize: "0.75rem",
            letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none",
          }}
        >
          ← Prestations
        </Link>
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 6vw" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 80, alignItems: "start" }}>

          {/* Left: description + process */}
          <div>
            {/* Description */}
            {service.shortDescription && (
              <p style={{ color: "var(--color-text)", fontSize: "1.1rem", lineHeight: 1.8, marginBottom: 48 }}>
                {service.shortDescription}
              </p>
            )}

            {/* Deliverables */}
            {service.deliverables?.length > 0 && (
              <div style={{ marginBottom: 56 }}>
                <h2 style={{ color: "var(--color-text)", fontSize: "1.1rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 24 }}>
                  Ce qui est inclus
                </h2>
                <ul style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {service.deliverables.map((d: string, i: number) => (
                    <li key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <span style={{ color: "var(--color-accent)", fontWeight: 700, flexShrink: 0, marginTop: 2 }}>—</span>
                      <span style={{ color: "var(--color-muted)", fontSize: "0.95rem", lineHeight: 1.6 }}>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Process */}
            {service.process?.length > 0 && (
              <div>
                <h2 style={{ color: "var(--color-text)", fontSize: "1.1rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 32 }}>
                  Comment ça se passe
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {service.process.map((step: any, i: number) => (
                    <div key={i} style={{ display: "flex", gap: 24, paddingBottom: 32, position: "relative" }}>
                      {/* Step number + vertical line */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 36 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: "50%",
                          background: "var(--color-accent)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#000", fontWeight: 800, fontSize: "0.8rem", flexShrink: 0,
                        }}>
                          {i + 1}
                        </div>
                        {i < service.process.length - 1 && (
                          <div style={{ width: 1, flex: 1, background: "var(--color-border)", marginTop: 8 }} />
                        )}
                      </div>
                      <div style={{ paddingTop: 6 }}>
                        <h3 style={{ color: "var(--color-text)", fontWeight: 700, fontSize: "1rem", marginBottom: 8 }}>
                          {step.title}
                        </h3>
                        {step.description && (
                          <p style={{ color: "var(--color-muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                            {step.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: pricing card + CTA */}
          <div style={{
            flexShrink: 0,
            width: 280,
            position: "sticky",
            top: 100,
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            padding: 32,
          }}>
            <p style={{ color: "var(--color-muted)", fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>
              Tarif
            </p>
            <p style={{ color: "var(--color-accent)", fontSize: label ? "1.6rem" : "1rem", fontWeight: 800, marginBottom: 8 }}>
              {label ?? "Sur devis"}
            </p>
            {!label && (
              <p style={{ color: "var(--color-muted)", fontSize: "0.82rem", marginBottom: 24 }}>
                Chaque projet est unique — parlons de votre besoin.
              </p>
            )}
            <div style={{ height: 1, background: "var(--color-border)", margin: "20px 0" }} />
            <Link
              href={`/devis?service=${encodeURIComponent(service.title)}`}
              style={{
                display: "block",
                padding: "14px 20px",
                background: "var(--color-accent)",
                color: "#000",
                fontWeight: 700,
                fontSize: "0.78rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                textDecoration: "none",
                textAlign: "center",
                marginBottom: 12,
              }}
            >
              Demander un devis
            </Link>
            <Link
              href="/prestations"
              style={{
                display: "block",
                padding: "12px 20px",
                border: "1px solid var(--color-border)",
                color: "var(--color-muted)",
                fontSize: "0.75rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              ← Toutes les prestations
            </Link>
          </div>
        </div>
      </div>

      {/* ── Gallery ──────────────────────────────────────────────── */}
      {service.gallery?.length > 0 && (
        <div style={{ padding: "0 6vw 80px", maxWidth: 1300, margin: "0 auto" }}>
          <h2 style={{ color: "var(--color-text)", fontSize: "1.1rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 32 }}>
            Galerie
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 8 }}>
            {service.gallery.map((img: any, i: number) => (
              <div key={img._key || i} style={{ position: "relative", aspectRatio: "4/3" }}>
                <Image
                  src={urlFor(img).width(600).quality(85).url()}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Vidéo d'exemple ─────────────────────────────────────── */}
      {service.videoExample && (service.videoExample.fileUrl || service.videoExample.url) && (
        <div style={{ background: "var(--color-bg)", borderTop: "1px solid var(--color-border)", padding: "80px 6vw" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <p style={{ color: "var(--color-accent)", fontSize: "0.7rem", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 12 }}>
              Exemple
            </p>
            <h2 style={{ color: "var(--color-text)", fontSize: "clamp(1.4rem, 2.5vw, 2rem)", fontWeight: 800, marginBottom: 36 }}>
              {service.videoExample.caption ?? "Voir un exemple de réalisation"}
            </h2>

            {/* Fichier uploadé */}
            {service.videoExample.videoType === "file" && service.videoExample.fileUrl ? (
              <div style={{ position: "relative", aspectRatio: "16/9", background: "#000" }}>
                <video
                  src={service.videoExample.fileUrl}
                  controls
                  playsInline
                  poster={service.videoExample.poster ? urlFor(service.videoExample.poster).width(900).quality(80).url() : undefined}
                  style={{ width: "100%", height: "100%", display: "block" }}
                />
              </div>
            ) : (
              /* Embed Vimeo / YouTube */
              (() => {
                const src = embedUrl(service.videoExample)
                return src ? (
                  <div style={{ position: "relative", aspectRatio: "16/9", background: "#000" }}>
                    <iframe
                      src={src}
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                    />
                  </div>
                ) : null
              })()
            )}
          </div>
        </div>
      )}

      {/* ── Projets associés ─────────────────────────────────────── */}
      {service.projects?.length > 0 && (
        <div style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-border)", padding: "80px 6vw" }}>
          <div style={{ maxWidth: 1300, margin: "0 auto" }}>
            <p style={{ color: "var(--color-accent)", fontSize: "0.7rem", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 12 }}>
              Références
            </p>
            <h2 style={{ color: "var(--color-text)", fontSize: "clamp(1.5rem, 3vw, 2.5rem)", fontWeight: 800, marginBottom: 48 }}>
              Projets réalisés
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
              {service.projects.map((project: any) => (
                <div key={project._id} style={{ overflow: "hidden", background: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
                  <div style={{ position: "relative", aspectRatio: "16/9" }}>
                    {project.coverImage && (
                      <Image
                        src={urlFor(project.coverImage).width(700).quality(85).url()}
                        alt={project.title}
                        fill
                        className="object-cover"
                        sizes="(max-width:768px) 100vw, 33vw"
                      />
                    )}
                  </div>
                  <div style={{ padding: "20px 24px" }}>
                    {project.location && (
                      <p style={{ color: "var(--color-accent)", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>
                        {project.location}
                      </p>
                    )}
                    <h3 style={{ color: "var(--color-text)", fontWeight: 700, fontSize: "1rem", marginBottom: 8 }}>
                      {project.title}
                    </h3>
                    {project.excerpt && (
                      <p style={{ color: "var(--color-muted)", fontSize: "0.85rem", lineHeight: 1.6 }}>
                        {project.excerpt}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── CTA final ───────────────────────────────────────────── */}
      <div style={{
        padding: "80px 6vw",
        textAlign: "center",
        borderTop: "1px solid var(--color-border)",
      }}>
        <p style={{ color: "var(--color-accent)", fontSize: "0.7rem", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 16 }}>
          Prêt à démarrer ?
        </p>
        <h2 style={{ color: "var(--color-text)", fontSize: "clamp(1.5rem, 3vw, 2.5rem)", fontWeight: 800, marginBottom: 20 }}>
          Parlons de votre projet
        </h2>
        <p style={{ color: "var(--color-muted)", maxWidth: 480, margin: "0 auto 40px" }}>
          Chaque aventure mérite d'être capturée avec soin. Contactez-moi pour un devis personnalisé.
        </p>
        <Link
          href={`/devis?service=${encodeURIComponent(service.title)}`}
          style={{
            display: "inline-block",
            padding: "16px 48px",
            background: "var(--color-accent)",
            color: "#000",
            fontWeight: 700,
            fontSize: "0.82rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          Demander un devis gratuit →
        </Link>
      </div>
    </>
  )
}
