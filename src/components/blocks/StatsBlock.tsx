export default function StatsBlock(props: any) {
  const items = props.items ?? []

  return (
    <section
      className="py-20 px-6"
      style={{ borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)" }}
    >
      <div className="max-w-5xl mx-auto">
        {props.title && (
          <h2 className="text-3xl font-bold text-center mb-14" style={{ color: "var(--color-text)" }}>
            {props.title}
          </h2>
        )}
        {items.length === 0 ? (
          <p className="text-center" style={{ color: "var(--color-muted)" }}>
            Aucune statistique. Ajoutez des entrées dans Sanity Studio.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            {items.map((item: any, i: number) => (
              <div key={i}>
                <p className="text-4xl md:text-5xl font-bold mb-2" style={{ color: "var(--color-accent)" }}>
                  {item.value}{item.suffix}
                </p>
                <p className="text-sm uppercase" style={{ color: "var(--color-muted)", letterSpacing: "0.15em" }}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
