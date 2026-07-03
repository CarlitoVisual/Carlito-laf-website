import Image from "next/image"
import Link from "next/link"
import { urlFor } from "@/lib/image"

type Tile = {
  _key: string
  keyword: string
  image: any
  href?: string
  width?: number
  height?: number
}

type Props = {
  eyebrow?: string
  title?: string
  tiles?: Tile[]
}

function clamp(value: number | undefined, fallback: number, min: number, max: number) {
  return Math.min(Math.max(value ?? fallback, min), max)
}

export default function SkillsBentoBlock({ eyebrow, title, tiles }: Props) {
  if (!tiles?.length) return null

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {(eyebrow || title) && (
          <div className="text-center mb-12">
            {eyebrow && (
              <p className="text-xs uppercase font-semibold mb-4" style={{ color: "var(--color-accent)", letterSpacing: "0.3em" }}>
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "var(--color-text)" }}>
                {title}
              </h2>
            )}
          </div>
        )}

        <div
          className="skills-bento-grid grid grid-cols-2 md:grid-cols-4"
          style={{ gap: 6, gridAutoRows: "160px" }}
        >
          {tiles.map((tile) => {
            const width = clamp(tile.width, 2, 1, 4)
            const height = clamp(tile.height, 1, 1, 3)
            const area = width * height

            const content = (
              <div
                className="group relative w-full h-full overflow-hidden"
                style={{ background: "var(--color-surface)" }}
              >
                {tile.image && (
                  <Image
                    src={urlFor(tile.image).width(900).quality(85).url()}
                    alt={tile.keyword}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                    sizes="(max-width:768px) 50vw, 25vw"
                  />
                )}

                <div
                  className="absolute inset-0 transition-opacity duration-300"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)" }}
                />

                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                  <p
                    className="font-semibold uppercase transition-colors duration-300"
                    style={{
                      color: "rgba(255,255,255,0.92)",
                      fontSize: area >= 4 ? 18 : 13,
                      letterSpacing: "0.08em",
                    }}
                  >
                    {tile.keyword}
                  </p>
                  {tile.href && (
                    <span
                      className="inline-block mt-1.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ color: "var(--color-accent)", letterSpacing: "0.1em" }}
                    >
                      Découvrir →
                    </span>
                  )}
                </div>
              </div>
            )

            return (
              <div
                key={tile._key}
                className="skills-bento-tile"
                style={{ "--tile-w": width, "--tile-h": height } as React.CSSProperties}
              >
                {tile.href ? (
                  <Link href={tile.href} className="block w-full h-full">
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
