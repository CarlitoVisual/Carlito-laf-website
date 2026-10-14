import type { Metadata } from "next"
import Link from "next/link"
import LegalPage from "@/components/legal/LegalPage"
import { LEGAL } from "@/lib/legal"

export const metadata: Metadata = {
  title: "Conditions générales d’utilisation",
  description: "Règles d’utilisation du site Carlito Laf Visuel.",
}

export default function CguPage() {
  return (
    <LegalPage title="Conditions d’utilisation">
      <h2>1. Objet</h2>
      <p>
        Les présentes conditions générales d’utilisation (CGU) encadrent l’accès et l’utilisation du site{" "}
        {LEGAL.website.replace("https://", "")}, édité par {LEGAL.ownerName} (voir les{" "}
        <Link href="/mentions-legales">mentions légales</Link>). En naviguant sur le site, vous acceptez ces CGU. Les
        ventes de tirages et de prestations sont régies par les <Link href="/cgv">conditions générales de vente</Link>.
      </p>

      <h2>2. Accès au site</h2>
      <p>
        Le site est accessible gratuitement, sans inscription. L’éditeur s’efforce d’en assurer la disponibilité mais
        peut l’interrompre pour maintenance ou en cas de force majeure, sans que sa responsabilité puisse être engagée.
      </p>

      <h2>3. Propriété intellectuelle</h2>
      <p>
        Toutes les photographies et vidéos sont des œuvres protégées. Il est interdit de les télécharger, copier,
        recadrer, modifier, republier ou utiliser (y compris pour entraîner un système d’intelligence artificielle) sans
        autorisation écrite. Le partage d’un lien vers une page du site est libre. Pour une licence d’utilisation,
        contactez-moi.
      </p>

      <h2>4. Formulaires</h2>
      <p>
        Vous vous engagez à fournir des informations exactes et à ne pas utiliser les formulaires pour envoyer des
        contenus illicites, du spam ou des messages au nom d’un tiers. Les données transmises sont traitées comme décrit
        dans la <Link href="/confidentialite">politique de confidentialité</Link>.
      </p>

      <h2>5. Liens externes</h2>
      <p>
        Le site peut contenir des liens vers d’autres sites (réseaux sociaux, prestataire de paiement, plateformes vidéo).
        L’éditeur n’est pas responsable de leur contenu ni de leurs pratiques en matière de données.
      </p>

      <h2>6. Responsabilité</h2>
      <p>
        Les informations du site sont fournies à titre indicatif et peuvent évoluer. L’éditeur ne saurait être tenu
        responsable d’un dommage résultant d’une utilisation anormale du site ou d’une indisponibilité temporaire.
      </p>

      <h2>7. Modification et droit applicable</h2>
      <p>
        Les CGU peuvent être modifiées à tout moment ; la version applicable est celle en ligne lors de votre visite.
        Elles sont soumises au droit français. En cas de litige, et après tentative de résolution amiable, les
        tribunaux français sont compétents.
      </p>
    </LegalPage>
  )
}
