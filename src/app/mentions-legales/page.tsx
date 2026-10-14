import type { Metadata } from "next"
import { pageMeta } from "@/lib/seo"
import Link from "next/link"
import LegalPage from "@/components/legal/LegalPage"
import { LEGAL, mediatorSentence } from "@/lib/legal"

export const metadata: Metadata = pageMeta({
  title: "Mentions légales",
  description: "Éditeur, hébergeur et propriété intellectuelle du site Carlito Laf Visuel.",
  path: "/mentions-legales",
})

export default function MentionsLegalesPage() {
  return (
    <LegalPage title="Mentions légales">
      <h2>Éditeur du site</h2>
      <p>
        Le site <strong>{LEGAL.website.replace("https://", "")}</strong> est édité par :
      </p>
      <ul>
        <li><strong>{LEGAL.ownerName}</strong>, exerçant sous le nom commercial « {LEGAL.brand} »</li>
        <li>Statut : {LEGAL.status}</li>
        <li>SIRET : {LEGAL.siret}</li>
        <li>Adresse : {LEGAL.address}</li>
        <li>E-mail : <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a></li>
        <li>Téléphone : {LEGAL.phone}</li>
        <li>{LEGAL.vat}</li>
      </ul>
      <p>Directeur de la publication : {LEGAL.publicationDirector}.</p>

      <h2>Hébergeur</h2>
      <p>
        {LEGAL.host.name} — {LEGAL.host.address} — <a href={LEGAL.host.website} target="_blank" rel="noopener noreferrer">{LEGAL.host.website.replace("https://", "")}</a>
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        L’ensemble des photographies, vidéos, textes et éléments graphiques présents sur ce site sont la propriété
        exclusive de {LEGAL.ownerName}, sauf mention contraire, et sont protégés par le Code de la propriété
        intellectuelle. Toute reproduction, représentation, modification ou diffusion, totale ou partielle, sans
        autorisation écrite préalable est interdite et constitue une contrefaçon (articles L335-2 et suivants du Code
        de la propriété intellectuelle).
      </p>
      <p>Pour toute demande de licence ou d’utilisation d’une image, écrivez-moi via la page <Link href="/contact">Contact</Link>.</p>

      <h2>Données personnelles et cookies</h2>
      <p>
        Le traitement de vos données est décrit dans la <Link href="/confidentialite">politique de confidentialité</Link>.
        Ce site ne dépose aucun cookie publicitaire ni de mesure d’audience.
      </p>

      <h2>Médiation de la consommation</h2>
      <p>
        Conformément aux articles L612-1 et suivants du Code de la consommation, en cas de litige non résolu,{" "}
        {mediatorSentence()}
      </p>

      <h2>Documents contractuels</h2>
      <ul>
        <li><Link href="/cgu">Conditions générales d’utilisation</Link></li>
        <li><Link href="/cgv">Conditions générales de vente</Link></li>
        <li><Link href="/remboursement">Retours et remboursements</Link></li>
        <li><Link href="/retractation">Renoncer au contrat (formulaire de rétractation)</Link></li>
      </ul>
    </LegalPage>
  )
}
