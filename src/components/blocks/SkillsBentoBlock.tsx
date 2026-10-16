import { urlFor } from "@/lib/image"
import type { BlockProps, SkillsBentoBlock as SkillsBentoBlockData } from "@/types/sanity"
import LineUp, { type LineUpPanel } from "./LineUp"

type Props = BlockProps<SkillsBentoBlockData>

/** Textes par défaut quand les champs « info », « accroche » et « bouton » ne sont pas remplis dans Sanity. */
const DEFAULTS: Record<string, Pick<LineUpPanel, "meta" | "description" | "cta" | "secondary">> = {
  "/portfolio": {
    meta: "Surf · océan · aventures",
    description: "Le surf en tête, puis l’océan, la montagne, la jungle et la rue : toutes les collections.",
    cta: "Explorer",
  },
  "/prestations": {
    meta: "Photo · vidéo · drone",
    description: "Photoshoot sport privé, récit d’aventure, plans drone, montages pour les réseaux.",
    cta: "Voir les offres",
  },
  "/boutique": {
    meta: "Fine Art · papier photo",
    description: "Fine Art Hahnemühle ou papier photo, imprimés à la demande. Ramenez la vague à la maison.",
    cta: "Voir les tirages",
    secondary: { label: "Voir un tirage chez moi", href: "/boutique/visualiser" },
  },
  "/contact": {
    meta: "Réponse sous 48 h",
    description: "Une session, un trip, une marque ? Racontez-moi votre projet, on en parle.",
    cta: "Écrire",
  },
}

/** Bloc « mosaïque de compétences » : désormais affiché en Line-up (panneaux qui s'ouvrent). */
export default function SkillsBentoBlock({ eyebrow, title, tiles }: Props) {
  if (!tiles?.length) return null

  const panels: LineUpPanel[] = tiles.map((t) => {
    const d = (t.href && DEFAULTS[t.href]) || {}
    return {
      key: t._key,
      title: t.keyword,
      href: t.href,
      imageUrl: t.image?.asset?._ref ? urlFor(t.image).width(1800).quality(85).url() : undefined,
      meta: t.meta || d.meta,
      description: t.description || d.description,
      cta: t.cta || d.cta,
      secondary: d.secondary,
    }
  })

  return <LineUp eyebrow={eyebrow} title={title || "Par où on commence ?"} panels={panels} />
}
