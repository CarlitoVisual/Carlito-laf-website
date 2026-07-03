import Image from "next/image"
import { urlFor } from "@/lib/image"

export default function TestimonialsBlock(props: any) {
  const items = props.items ?? []

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {props.title && (
          <h2
            className="text-3xl md:text-4xl font-bold mb-16 text-center"
            style={{ color: "var(--color-text)" }}
          >
            {props.title}
          </h2>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((t: any, i: number) => (
            <div
              key={t._id || i}
              className="flex flex-col p-8"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              {t.rating && (
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j} style={{ color: "var(--color-accent)" }}>
                      ★
                    </span>
                  ))}
                </div>
              )}

              <p
                className="text-base italic leading-relaxed flex-1 mb-8"
                style={{ color: "var(--color-muted)" }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-4">
                {t.avatar && (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={urlFor(t.avatar).width(96).url()}
                      alt={t.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--color-text)" }}
                  >
                    {t.name}
                  </p>
                  {(t.role || t.company) && (
                    <p
                      className="text-xs"
                      style={{ color: "var(--color-muted)" }}
                    >
                      {t.role}
                      {t.role && t.company ? " · " : ""}
                      {t.company}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
