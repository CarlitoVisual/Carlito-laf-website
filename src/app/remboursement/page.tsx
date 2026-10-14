import type { Metadata } from "next"
import Link from "next/link"
import LegalPage from "@/components/legal/LegalPage"
import { LEGAL, mediatorSentence } from "@/lib/legal"

export const metadata: Metadata = {
  title: "Retours et remboursements",
  description: "Comment retourner un tirage, se rétracter ou être remboursé chez Carlito Laf Visuel.",
}

export default function RemboursementPage() {
  return (
    <LegalPage
      eyebrow="Boutique & prestations"
      title="Retours et remboursements"
      intro={<p>L’essentiel en clair. Le détail juridique figure dans les <Link href="/cgv">conditions générales de vente</Link>.</p>}
    >
      <h2>Vous changez d’avis</h2>
      <ul>
        <li>Vous avez <strong>14 jours</strong> à partir de la réception de votre tirage (ou de la conclusion du contrat pour une prestation) pour vous rétracter, sans justification.</li>
        <li>Le plus simple : le formulaire <Link href="/retractation">« Renoncer au contrat ici »</Link>. Vous recevez immédiatement un accusé de réception par e-mail. Vous pouvez aussi m’écrire à <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.</li>
        <li>Renvoyez ensuite le tirage dans son emballage d’origine sous 14 jours. Les frais de retour sont à votre charge.</li>
        <li>Exceptions : tirages réalisés sur mesure (format, papier, encadrement ou recadrage personnalisés), fichiers numériques déjà téléchargés et prestations entièrement réalisées à votre demande avant la fin du délai.</li>
      </ul>

      <h2>Le tirage arrive abîmé ou ne correspond pas</h2>
      <ul>
        <li>Signalez-le dès que possible, photos à l’appui, à <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.</li>
        <li>Au titre de la garantie légale de conformité (2 ans), je vous propose une réimpression ou un remplacement sans frais, ou à défaut un remboursement. Les frais de retour sont alors à ma charge.</li>
      </ul>

      <h2>Délais et mode de remboursement</h2>
      <ul>
        <li>Remboursement de la totalité des sommes versées, livraison standard comprise, au plus tard <strong>14 jours</strong> après votre demande de rétractation.</li>
        <li>Pour un tirage, le remboursement peut attendre la réception du colis retourné ou la preuve de son expédition.</li>
        <li>Le remboursement se fait avec le moyen de paiement utilisé lors de l’achat, sans frais pour vous.</li>
      </ul>

      <h2>Prestations photo / vidéo</h2>
      <ul>
        <li>Si la météo ou la sécurité empêche la séance, elle est reportée sans frais.</li>
        <li>Les conditions d’annulation de votre fait sont précisées dans votre devis et dans les <Link href="/cgv">CGV</Link>.</li>
      </ul>

      <h2>Un désaccord ?</h2>
      <p>
        Écrivez-moi d’abord : je cherche toujours une solution amiable. À défaut, {mediatorSentence()}
      </p>
    </LegalPage>
  )
}
