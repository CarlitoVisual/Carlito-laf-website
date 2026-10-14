import Image from "next/image"
import Link from "next/link"

type Props = {
  /** Photo affichée dans le cadre de l'illustration */
  imageUrl?: string
  /** Version courte (pages de collection) */
  compact?: boolean
}

const STEPS = [
  { n: "01", title: "Photographiez votre mur", text: "Depuis votre téléphone, en quelques secondes." },
  { n: "02", title: "Choisissez un tirage", text: "Format, cadre et passe-partout." },
  { n: "03", title: "Voyez-le chez vous", text: "À l’échelle réelle, avant de commander." },
]

/** Bandeau qui met en avant l'essai virtuel « Voir un tirage chez moi ». */
export default function TryAtHomeBanner({ imageUrl, compact }: Props) {
  if (compact) {
    return (
      <div className="max-w-7xl mx-auto px-6 pt-10">
        <Link
          href="/boutique/visualiser"
          className="group flex flex-wrap items-center justify-between gap-4 rounded-xl px-6 py-5 transition-colors"
          style={{ background: "var(--gradient-depth)", border: "1px solid var(--color-border)" }}
        >
          <div className="flex items-center gap-4">
            <HouseIcon />
            <div>
              <p className="font-display uppercase font-black text-2xl" style={{ color: "var(--color-text)" }}>Hésitant sur le format ?</p>
              <p className="text-sm" style={{ color: "var(--color-muted)" }}>Essayez gratuitement un tirage sur votre propre mur, à l’échelle réelle.</p>
            </div>
          </div>
          <span className="inline-flex items-center min-h-12 px-6 rounded-full text-xs font-bold uppercase transition-transform group-hover:translate-x-1" style={{ background: "var(--color-accent)", color: "var(--color-on-accent)", letterSpacing: "0.12em" }}>
            Essayer chez moi →
          </span>
        </Link>
      </div>
    )
  }

  return (
    <section className="px-6 py-16" style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
      <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-12">
        <div className="min-w-0 flex flex-col gap-6" style={{ flex: "1 1 380px" }}>
          <p className="font-mono-data text-xs uppercase" style={{ color: "var(--color-data)", letterSpacing: "0.18em" }}>
            Nouveau · Essai virtuel gratuit
          </p>
          <h2 className="text-5xl md:text-6xl" style={{ color: "var(--color-text)" }}>Essayez avant d’acheter</h2>
          <p style={{ color: "var(--color-muted)", lineHeight: 1.65 }}>
            Un tirage de 60x90 sur votre mur, ça donne quoi ? Importez une photo de votre pièce et voyez le rendu en un
            instant. Votre photo reste sur votre appareil.
          </p>
          <ol className="flex flex-col gap-4">
            {STEPS.map((s) => (
              <li key={s.n} className="flex gap-4 items-start">
                <span className="font-mono-data text-sm shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ border: "1px solid var(--color-accent)", color: "var(--color-accent)" }}>
                  {s.n}
                </span>
                <span>
                  <span className="block font-semibold" style={{ color: "var(--color-text)" }}>{s.title}</span>
                  <span className="block text-sm" style={{ color: "var(--color-muted)" }}>{s.text}</span>
                </span>
              </li>
            ))}
          </ol>
          <Link
            href="/boutique/visualiser"
            className="self-start inline-flex items-center gap-3 min-h-14 px-8 rounded-full text-sm font-bold uppercase"
            style={{ background: "var(--color-accent)", color: "var(--color-on-accent)", letterSpacing: "0.1em" }}
          >
            <HouseIcon size={18} inherit />
            Voir un tirage chez moi
          </Link>
        </div>

        {/* Illustration : un tirage encadré au-dessus d'un canapé */}
        <Link href="/boutique/visualiser" aria-label="Essayer un tirage chez moi" className="min-w-0 block rounded-xl overflow-hidden relative" style={{ flex: "1 1 380px", aspectRatio: "4 / 3", background: "linear-gradient(180deg, #EDE3D3 0%, #E3D6C1 78%, #C9B79B 78%, #BBA889 100%)" }}>
          <div className="absolute left-1/2 -translate-x-1/2 shadow-2xl" style={{ top: "14%", width: "46%", aspectRatio: "3 / 2", background: "#1b1b1b", padding: "2.2%" }}>
            <div className="w-full h-full" style={{ background: "#fbfaf7", padding: "6%" }}>
              <div className="relative w-full h-full overflow-hidden">
                {imageUrl ? (
                  <Image src={imageUrl} alt="" fill sizes="(max-width:768px) 40vw, 260px" className="object-cover" />
                ) : (
                  <div className="w-full h-full" style={{ background: "var(--gradient-depth)" }} />
                )}
              </div>
            </div>
          </div>
          <div className="absolute rounded-t-3xl rounded-b-lg" style={{ left: "18%", right: "18%", bottom: "14%", height: "20%", background: "#0B3352" }} />
          <div className="absolute rounded-xl" style={{ left: "14%", width: "10%", bottom: "14%", height: "24%", background: "#0F4A75" }} />
          <div className="absolute rounded-xl" style={{ right: "14%", width: "10%", bottom: "14%", height: "24%", background: "#0F4A75" }} />
          <span className="absolute font-mono-data text-xs px-3 py-1.5 rounded-full" style={{ top: 14, right: 14, background: "rgba(5,27,46,0.85)", color: "var(--color-data)" }}>
            60 × 90 cm
          </span>
        </Link>
      </div>
    </section>
  )
}

function HouseIcon({ size = 28, inherit }: { size?: number; inherit?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" style={{ color: inherit ? "inherit" : "var(--color-accent)", flexShrink: 0 }}>
      <path d="M3 10.5 12 3l9 7.5V21H3z" />
      <rect x="8" y="10" width="8" height="6" />
    </svg>
  )
}
