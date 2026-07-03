import Link from "next/link"

export default function CTABlock(props: any) {
  return (
    <section
      className="py-28 px-6 text-center relative overflow-hidden"
      style={{ background: "var(--color-surface)" }}
    >
      {/* Decorative line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16"
        style={{
          background:
            "linear-gradient(to bottom, transparent, var(--color-accent))",
        }}
      />

      <div className="max-w-2xl mx-auto">
        {props.eyebrow && (
          <p
            className="text-xs uppercase font-semibold mb-6"
            style={{ color: "var(--color-accent)", letterSpacing: "0.3em" }}
          >
            {props.eyebrow}
          </p>
        )}

        <h2
          className="text-4xl md:text-5xl font-bold mb-6 leading-tight"
          style={{ color: "var(--color-text)" }}
        >
          {props.title}
        </h2>

        {props.description && (
          <p className="text-base mb-10 leading-relaxed" style={{ color: "var(--color-muted)" }}>
            {props.description}
          </p>
        )}

        <div className="flex flex-wrap gap-4 justify-center">
          {props.buttons?.map((btn: any, i: number) => (
            <Link
              key={i}
              href={btn.link?.href || btn.url || "#"}
              className="inline-block text-sm uppercase px-8 py-4 font-semibold transition-all duration-300"
              style={
                btn.style === "outline"
                  ? {
                      border: "1px solid var(--color-accent)",
                      color: "var(--color-accent)",
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

          {!props.buttons?.length && (
            <Link
              href="/devis"
              className="inline-block text-sm uppercase px-8 py-4 font-semibold"
              style={{
                background: "var(--color-accent)",
                color: "#000",
                letterSpacing: "0.2em",
              }}
            >
              Demander un devis
            </Link>
          )}
        </div>
      </div>

      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-16"
        style={{
          background:
            "linear-gradient(to top, transparent, var(--color-accent))",
        }}
      />
    </section>
  )
}
