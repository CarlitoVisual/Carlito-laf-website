export default function TimelineBlock(props: any) {
  const items = props.items ?? []

  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        {props.title && (
          <h2 className="text-3xl md:text-4xl font-bold mb-16" style={{ color: "var(--color-text)" }}>
            {props.title}
          </h2>
        )}

        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-0 top-0 bottom-0 w-px"
            style={{ background: "var(--color-border)" }}
          />

          <div className="space-y-12">
            {items.map((item: any, i: number) => (
              <div key={i} className="pl-10 relative">
                {/* Dot */}
                <div
                  className="absolute left-0 top-1 w-2 h-2 rounded-full -translate-x-1/2"
                  style={{ background: "var(--color-accent)" }}
                />
                {item.year && (
                  <p
                    className="text-xs uppercase font-semibold mb-1"
                    style={{ color: "var(--color-accent)", letterSpacing: "0.2em" }}
                  >
                    {item.year}
                  </p>
                )}
                {item.title && (
                  <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--color-text)" }}>
                    {item.title}
                  </h3>
                )}
                {item.description && (
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
