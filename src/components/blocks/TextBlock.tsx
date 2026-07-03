import Image from "next/image"
import { PortableText } from "next-sanity"
import { urlFor } from "@/lib/image"

const ptComponents = {
  block: {
    normal: ({ children }: any) => (
      <p className="text-base leading-relaxed mb-5" style={{ color: "var(--color-muted)" }}>{children}</p>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-2xl font-bold mt-10 mb-4" style={{ color: "var(--color-text)" }}>{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-xl font-semibold mt-8 mb-3" style={{ color: "var(--color-text)" }}>{children}</h3>
    ),
    blockquote: ({ children }: any) => (
      <blockquote
        className="border-l-2 pl-5 my-6 italic text-lg"
        style={{ borderColor: "var(--color-accent)", color: "var(--color-muted)" }}
      >
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }: any) => (
      <strong style={{ color: "var(--color-text)", fontWeight: 700 }}>{children}</strong>
    ),
    em: ({ children }: any) => (
      <em style={{ color: "var(--color-accent)" }}>{children}</em>
    ),
    underline: ({ children }: any) => (
      <span style={{ textDecoration: "underline", textDecorationColor: "var(--color-accent)" }}>{children}</span>
    ),
    link: ({ children, value }: any) => (
      <a
        href={value?.href}
        target={value?.href?.startsWith("http") ? "_blank" : undefined}
        rel="noopener noreferrer"
        style={{ color: "var(--color-accent)", textDecoration: "underline" }}
      >
        {children}
      </a>
    ),
  },
}

const maxWidth: Record<string, string> = {
  narrow: "42rem",
  default: "52rem",
  large: "72rem",
  twoColumns: "80rem",
}

export default function TextBlock(props: any) {
  const { title, subtitle, content, layout = "default", alignment = "left", image, imagePosition = "right" } = props
  const isCenter = alignment === "center"
  const isTwoCol = layout === "twoColumns"

  return (
    <section className="py-24 px-6">
      <div
        className="mx-auto"
        style={{ maxWidth: maxWidth[layout] || "52rem" }}
      >
        {/* Header */}
        {(title || subtitle) && (
          <div className={`mb-10 ${isCenter ? "text-center" : ""}`}>
            {subtitle && (
              <p
                className="text-xs uppercase font-semibold mb-3"
                style={{ color: "var(--color-accent)", letterSpacing: "0.25em" }}
              >
                {subtitle}
              </p>
            )}
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "var(--color-text)" }}>
                {title}
              </h2>
            )}
          </div>
        )}

        {/* Two-column layout */}
        {isTwoCol && image ? (
          <div className={`flex flex-col md:flex-row gap-12 items-center ${imagePosition === "left" ? "md:flex-row-reverse" : ""}`}>
            <div className="flex-1">
              {content && <PortableText value={content} components={ptComponents} />}
            </div>
            <div className="flex-1 relative" style={{ minHeight: 320 }}>
              <Image
                src={urlFor(image).width(800).quality(90).url()}
                alt={title || ""}
                fill
                className="object-cover"
                sizes="(max-width:768px) 100vw, 50vw"
              />
            </div>
          </div>
        ) : (
          <div className={isCenter ? "text-center" : ""}>
            {content && <PortableText value={content} components={ptComponents} />}
          </div>
        )}
      </div>
    </section>
  )
}
