export default function QuoteBlock(props: any) {
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <div
          className="text-6xl mb-6 leading-none"
          style={{ color: "var(--color-accent)", fontFamily: "Georgia, serif" }}
        >
          "
        </div>
        <blockquote
          className="text-2xl md:text-3xl font-light italic leading-relaxed mb-8"
          style={{ color: "var(--color-text)" }}
        >
          {props.quote}
        </blockquote>
        {props.author && (
          <p
            className="text-sm uppercase"
            style={{ color: "var(--color-accent)", letterSpacing: "0.2em" }}
          >
            — {props.author}
            {props.role ? `, ${props.role}` : ""}
          </p>
        )}
      </div>
    </section>
  )
}
