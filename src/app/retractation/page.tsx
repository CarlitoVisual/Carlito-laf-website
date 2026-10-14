import type { Metadata } from "next"
import { pageMeta } from "@/lib/seo"
import Link from "next/link"
import LegalPage from "@/components/legal/LegalPage"
import WithdrawalForm from "./WithdrawalForm"

export const metadata: Metadata = pageMeta({
  title: "Renoncer au contrat",
  description: "Fonction de rétractation en ligne : exercez votre droit de rétractation de 14 jours.",
  path: "/retractation",
})

export default function RetractationPage() {
  return (
    <LegalPage
      eyebrow="Droit de rétractation"
      title="Renoncer au contrat ici"
      intro={
        <p>
          Vous disposez de 14 jours pour vous rétracter d’un achat de tirage ou d’une prestation, sans justification.
          Remplissez ce formulaire, vérifiez, puis confirmez : un accusé de réception vous est envoyé immédiatement par
          e-mail. Conditions et exceptions : <Link href="/cgv#retractation">CGV</Link> · <Link href="/remboursement">retours et remboursements</Link>.
        </p>
      }
    >
      <WithdrawalForm />
    </LegalPage>
  )
}
