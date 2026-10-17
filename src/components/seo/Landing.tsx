import Image from "next/image"
import Link from "next/link"
import { urlFor } from "@/lib/image"
import type { SanityImage } from "@/types/sanity"

/** Briques communes des pages d'atterrissage SEO (surf, tirages paysage). Composants serveur : tout le texte est dans le HTML. */

export type LandingPhoto = { _id: string; title?: string; alt?: string; image?: SanityImage; href?: string }

export function LandingHeader({
  eyebrow,
  title,
  lead,
  actions,
  crumbs,
}: {
  eyebrow: string
  title: string
  lead: React.ReactNode
  actions: { href: string; label: string; primary?: boolean }[]
  crumbs: [string, string][]
}) {
  return (
    <header className="pt-32 pb-14 px-6" style={{ borderBottom: "1px solid var(--color-border)" }}>
      <div className="max-w-5xl mx-auto">
        <nav aria-label="Fil d’Ariane" className="text-xs uppercase mb-8" style={{ color: "var(--color-muted)", letterSpacing: "0.15em" }}>
          {crumbs.map(([label, href], i) => (
            <span key={href}>
              {i > 0 && <span className="mx-2">/</span>}
              {i < crumbs.length - 1 ? (
                <Link href={href} className="hover:underline">
                  {label}
                </Link>
              ) : (
                <span aria-current="page">{label}</span>
              )}
            </span>
          ))}
        </nav>
        <p className="font-mono-data text-xs uppercase mb-4" style={{ color: "var(--color-accent)", letterSpacing: "0.25em" }}>
          {eyebrow}
        </p>
        <h1 className="text-4xl md:text-6xl" style={{ color: "var(--color-text)" }}>
          {title}
        </h1>
        <div className="mt-8 max-w-3xl text-lg leading-relaxed space-y-4" style={{ color: "var(--color-text)" }}>
          {lead}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          {actions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="text-xs uppercase px-6 py-3 rounded-full border transition-all"
              style={
                a.primary
                  ? { background: "var(--color-accent)", color: "var(--color-on-accent)", borderColor: "var(--color-accent)", letterSpacing: "0.15em", fontWeight: 600 }
                  : { color: "var(--color-accent)", borderColor: "var(--color-accent)", letterSpacing: "0.15em" }
              }
            >
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}

export function LandingSection({
  title,
  intro,
  children,
  alt,
}: {
  title: string
  intro?: React.ReactNode
  children?: React.ReactNode
  alt?: boolean
}) {
  return (
    <section className="py-16 px-6" style={alt ? { background: "var(--color-surface)" } : undefined}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl" style={{ color: "var(--color-text)" }}>
          {title}
        </h2>
        {intro && (
          <div className="mt-5 max-w-3xl leading-relaxed space-y-4" style={{ color: "var(--color-muted)" }}>
            {intro}
          </div>
        )}
        {children && <div className="mt-10">{children}</div>}
      </div>
    </section>
  )
}

export function CardGrid({ items }: { items: { title: string; text: React.ReactNode; href?: string; linkLabel?: string }[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {items.map((it) => (
        <div
          key={it.title}
          className="rounded-2xl p-6 flex flex-col"
          style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}
        >
          <h3 className="text-2xl" style={{ color: "var(--color-accent)" }}>
            {it.title}
          </h3>
          <div className="mt-3 text-sm leading-relaxed flex-1" style={{ color: "var(--color-text)" }}>
            {it.text}
          </div>
          {it.href && (
            <Link href={it.href} className="mt-5 text-xs uppercase" style={{ color: "var(--color-accent)", letterSpacing: "0.15em" }}>
              {it.linkLabel ?? "En savoir plus"} →
            </Link>
          )}
        </div>
      ))}
    </div>
  )
}

export function PhotoStrip({ photos, defaultHref }: { photos: LandingPhoto[]; defaultHref: string }) {
  if (!photos.length) return null
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {photos.map((p) => {
        const src = urlFor(p.image).width(900).height(675).fit("crop").quality(80).url()
        if (!src) return null
        return (
          <Link key={p._id} href={p.href ?? defaultHref} className="relative block aspect-[4/3] overflow-hidden rounded-xl group">
            <Image
              src={src}
              alt={p.alt || p.title || ""}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>
        )
      })}
    </div>
  )
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y" style={{ borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)" }}>
      {items.map((it) => (
        <details key={it.q} className="group py-5" style={{ borderColor: "var(--color-border)" }}>
          <summary className="cursor-pointer list-none flex justify-between gap-6 text-lg font-medium" style={{ color: "var(--color-text)" }}>
            {it.q}
            <span aria-hidden className="transition-transform group-open:rotate-45" style={{ color: "var(--color-accent)" }}>
              +
            </span>
          </summary>
          <p className="mt-3 leading-relaxed" style={{ color: "var(--color-muted)" }}>
            {it.a}
          </p>
        </details>
      ))}
    </div>
  )
}

/** Données structurées FAQPage, construites à partir des mêmes questions que celles affichées. */
export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  }
}

export function FinalCta({ title, text, href, label }: { title: string; text: string; href: string; label: string }) {
  return (
    <section className="py-20 px-6 text-center" style={{ background: "var(--gradient-depth)" }}>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-5xl" style={{ color: "var(--color-text)" }}>
          {title}
        </h2>
        <p className="mt-5 leading-relaxed" style={{ color: "var(--color-text)" }}>
          {text}
        </p>
        <Link
          href={href}
          className="inline-block mt-8 text-xs uppercase px-8 py-4 rounded-full"
          style={{ background: "var(--color-accent)", color: "var(--color-on-accent)", letterSpacing: "0.15em", fontWeight: 600 }}
        >
          {label}
        </Link>
      </div>
    </section>
  )
}
