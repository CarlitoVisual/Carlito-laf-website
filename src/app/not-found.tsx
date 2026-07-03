import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center">
      <div>
        <p
          className="text-8xl font-bold mb-4"
          style={{ color: "var(--color-border)" }}
        >
          404
        </p>
        <h1
          className="text-2xl font-bold mb-4"
          style={{ color: "var(--color-text)" }}
        >
          Page introuvable
        </h1>
        <p className="mb-8" style={{ color: "var(--color-muted)" }}>
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="inline-block text-sm uppercase px-8 py-3 font-semibold"
          style={{
            background: "var(--color-accent)",
            color: "#000",
            letterSpacing: "0.2em",
          }}
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  )
}
