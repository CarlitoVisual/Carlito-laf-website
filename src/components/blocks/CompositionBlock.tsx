import Image from "next/image"
import { PortableText } from "next-sanity"
import AmbientVideo from "@/components/AmbientVideo"
import ConsentEmbed from "@/components/legal/ConsentEmbed"
import { ptComponents } from "@/components/blocks/TextBlock"
import { urlFor } from "@/lib/image"
import type {
  BlockProps,
  CompositionBlock as CompositionBlockData,
  CompositionItem,
  SanityImage,
} from "@/types/sanity"

// Classes écrites en toutes lettres pour que Tailwind les génère
const SPAN: Record<string, string> = {
  full: "md:col-span-12",
  threeQuarters: "md:col-span-9",
  twoThirds: "md:col-span-8",
  half: "md:col-span-6",
  third: "md:col-span-4",
  quarter: "md:col-span-6 lg:col-span-3",
}
const SIZES: Record<string, string> = {
  full: "100vw",
  threeQuarters: "(min-width: 768px) 75vw, 100vw",
  twoThirds: "(min-width: 768px) 66vw, 100vw",
  half: "(min-width: 768px) 50vw, 100vw",
  third: "(min-width: 768px) 33vw, 100vw",
  quarter: "(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw",
}
const ALIGN: Record<string, string> = { top: "self-start", center: "self-center", bottom: "self-end" }
const CONTAINER: Record<string, string> = {
  narrow: "max-w-3xl px-6",
  normal: "max-w-6xl px-6",
  wide: "max-w-[90rem] px-6",
  full: "max-w-none px-4 md:px-8",
}
const GAP: Record<string, string> = {
  small: "gap-4",
  medium: "gap-8 md:gap-10",
  large: "gap-12 md:gap-16",
}
const RATIO: Record<string, number> = {
  "16-9": 16 / 9,
  "3-2": 3 / 2,
  "4-3": 4 / 3,
  square: 1,
  portrait: 4 / 5,
  vertical: 9 / 16,
}

/** Dimensions d'origine lues dans la référence Sanity (image-<id>-<l>x<h>-<ext>). */
function originalSize(img?: SanityImage) {
  const m = img?.asset?._ref?.match(/-(\d+)x(\d+)-/)
  return m ? { w: Number(m[1]), h: Number(m[2]) } : null
}

function Caption({ text }: { text?: string }) {
  if (!text) return null
  return (
    <figcaption className="mt-3 text-sm" style={{ color: "var(--color-muted)" }}>
      {text}
    </figcaption>
  )
}

function Item({ item }: { item: CompositionItem }) {
  const width = item.width || (item._type === "compoVideo" ? "full" : "half")
  const ratio = RATIO[item.aspectRatio || ""]

  if (item._type === "compoText") {
    if (!item.content?.length) return null
    return (
      <div className={`[&>*:first-child]:mt-0 [&>*:last-child]:mb-0${item.textAlign === "center" ? " text-center" : ""}`}>
        <PortableText value={item.content} components={ptComponents} />
      </div>
    )
  }

  if (item._type === "compoImage") {
    const orig = originalSize(item.image)
    if (!item.image?.asset || !orig) return null
    const w = Math.min(2000, orig.w)
    const h = Math.round(ratio ? w / ratio : (w * orig.h) / orig.w)
    const builder = urlFor(item.image).width(w).auto("format").quality(80)
    const src = (ratio ? builder.height(h).fit("crop") : builder).url()
    return (
      <figure>
        <Image
          src={src}
          alt={item.image.alt || item.caption || ""}
          width={w}
          height={h}
          sizes={SIZES[width]}
          className="w-full h-auto rounded-sm"
        />
        <Caption text={item.caption} />
      </figure>
    )
  }

  // compoVideo
  const mode = item.mode || "ambient"
  const poster = item.poster?.asset ? urlFor(item.poster).width(1600).auto("format").url() : undefined
  const frameStyle = { aspectRatio: String(ratio || 16 / 9) }

  if (mode === "embed") {
    if (!item.url) return null
    return (
      <figure>
        <div className="relative w-full overflow-hidden rounded-sm" style={frameStyle}>
          <ConsentEmbed url={item.url} title={item.caption || "Vidéo"} className="absolute inset-0 w-full h-full" />
        </div>
        <Caption text={item.caption} />
      </figure>
    )
  }

  const src = item.file?.asset?.url
  if (!src) return null
  // « Original » : la vidéo garde ses proportions ; sinon elle est recadrée au format choisi
  const fill = ratio ? "absolute inset-0 w-full h-full object-cover" : "w-full h-auto"
  return (
    <figure>
      <div className={`relative w-full overflow-hidden rounded-sm${ratio ? "" : " leading-none"}`} style={ratio ? frameStyle : undefined}>
        {mode === "player" ? (
          <video src={src} poster={poster} controls playsInline preload="metadata" className={fill} />
        ) : (
          <AmbientVideo src={src} poster={poster} className={fill} />
        )}
      </div>
      <Caption text={item.caption} />
    </figure>
  )
}

export default function CompositionBlock(props: BlockProps<CompositionBlockData>) {
  const { title, subtitle, items, container = "normal", gap = "medium", background = "default" } = props
  if (!items?.length) return null

  return (
    <section
      className="py-20 md:py-24"
      style={{ background: background === "surface" ? "var(--color-surface)" : "var(--color-bg)" }}
    >
      <div className={`mx-auto ${CONTAINER[container] ?? CONTAINER.normal}`}>
        {(title || subtitle) && (
          <div className="mb-12">
            {subtitle && (
              <p
                className="text-xs uppercase font-semibold mb-3"
                style={{ color: "var(--color-accent)", letterSpacing: "0.25em" }}
              >
                {subtitle}
              </p>
            )}
            {title && (
              <h2 className="text-3xl md:text-5xl" style={{ color: "var(--color-text)" }}>
                {title}
              </h2>
            )}
          </div>
        )}

        <div className={`grid grid-cols-1 md:grid-cols-12 ${GAP[gap] ?? GAP.medium}`}>
          {items.map((item, i) => {
            const width = item.width || (item._type === "compoVideo" ? "full" : "half")
            const cls = [
              "col-span-1",
              SPAN[width] ?? SPAN.half,
              ALIGN[item.verticalAlign || "top"],
              item.newLine ? "md:col-start-1" : "",
            ].join(" ")
            return (
              <div key={item._key || i} className={cls}>
                <Item item={item} />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
