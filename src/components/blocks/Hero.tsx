import Image from "next/image"
import Link from "next/link"
import { urlFor } from "@/lib/image"

export default function Hero(props: any) {
  const imageUrl = props.image
    ? urlFor(props.image).width(2400).quality(90).url()
    : null

  const overlay = (props.overlay ?? 50) / 100

  return (
    <section
      className="relative overflow-hidden flex items-center justify-center"
      style={{ minHeight: props.height || "100vh" }}
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={props.title || "Hero"}
          fill
          priority
          className="object-cover"
        />
      )}

      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, rgba(0,0,0,${overlay * 0.6}) 0%, rgba(0,0,0,${overlay}) 100%)`,
        }}
      />

      <div
        className="relative z-10 px-6 max-w-5xl w-full mx-auto"
        style={{
          textAlign:
            props.alignment === "left"
              ? "left"
              : props.alignment === "right"
              ? "right"
              : "center",
        }}
      >
        {props.eyebrow && (
          <p
            className="text-xs uppercase font-semibold mb-6"
            style={{ color: "var(--color-accent)", letterSpacing: "0.3em" }}
          >
            {props.eyebrow}
          </p>
        )}

        <h1
          className="text-5xl md:text-7xl xl:text-8xl font-bold text-white leading-none mb-6"
          style={{ textShadow: "0 2px 40px rgba(0,0,0,0.5)" }}
        >
          {props.title}
        </h1>

        {props.subtitle && (
          <p
            className="text-lg md:text-xl max-w-2xl mt-4 leading-relaxed"
            style={{
              color: "rgba(240,237,232,0.8)",
              margin: "1rem auto 0",
            }}
          >
            {props.subtitle}
          </p>
        )}

        {props.buttons?.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-10 justify-center">
            {props.buttons.map((btn: any, i: number) => (
              <Link
                key={i}
                href={btn.link?.href || btn.url || "#"}
                className="inline-block text-sm uppercase px-8 py-4 transition-all duration-300 font-semibold"
                style={
                  btn.style === "outline"
                    ? {
                        border: "1px solid rgba(255,255,255,0.5)",
                        color: "#fff",
                        letterSpacing: "0.2em",
                      }
                    : {
                        background: "var(--color-accent)",
                        color: "#000",
                        letterSpacing: "0.2em",
                      }
                }
              >
                {btn.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span
          className="text-xs uppercase"
          style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.25em" }}
        >
          Scroll
        </span>
        <div
          className="w-px h-10"
          style={{
            background:
              "linear-gradient(to bottom, rgba(200,169,110,0.6), transparent)",
          }}
        />
      </div>
    </section>
  )
}
