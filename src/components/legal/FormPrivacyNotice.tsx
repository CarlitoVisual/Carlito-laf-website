import Link from "next/link"

type Props = { purpose: string; small?: boolean }

/** Mention d'information RGPD affichée sous chaque formulaire (art. 13 RGPD). */
export default function FormPrivacyNotice({ purpose, small }: Props) {
  return (
    <p style={{ color: "var(--color-muted)", fontSize: small ? "0.7rem" : "0.75rem", lineHeight: 1.55 }}>
      Les informations marquées d’un * sont nécessaires pour {purpose}. Elles ne sont utilisées que dans ce but, ne sont
      jamais cédées à des tiers et sont conservées pour une durée limitée. Vous pouvez y accéder, les rectifier ou les
      faire effacer à tout moment.{" "}
      <Link href="/confidentialite" style={{ color: "var(--color-accent)", textDecoration: "underline" }}>
        En savoir plus
      </Link>
    </p>
  )
}
