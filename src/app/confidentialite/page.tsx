import type { Metadata } from "next"
import Link from "next/link"
import LegalPage from "@/components/legal/LegalPage"
import { LEGAL, PROCESSORS } from "@/lib/legal"

export const metadata: Metadata = {
  title: "Politique de confidentialité et cookies",
  description: "Quelles données sont collectées sur Carlito Laf Visuel, pourquoi, combien de temps, et vos droits.",
}

const TREATMENTS = [
  {
    purpose: "Répondre à un message ou établir un devis (formulaires Contact et Devis)",
    data: "Nom, e-mail, type de projet, message. Facultatifs : téléphone, lieu, date et budget du projet.",
    basis: "Mesures précontractuelles prises à votre demande (art. 6.1.b RGPD).",
    duration: "3 ans après notre dernier échange si aucun contrat n’est conclu.",
  },
  {
    purpose: "Traiter une commande de tirage (boutique)",
    data: "Nom, e-mail, produit, format, quantité. Facultatifs : téléphone, message.",
    basis: "Exécution du contrat (art. 6.1.b) et obligations comptables (art. 6.1.c).",
    duration: "5 ans après la fin de la relation commerciale ; factures conservées 10 ans (art. L123-22 du Code de commerce).",
  },
  {
    purpose: "Vous prévenir quand une photo devient disponible en tirage",
    data: "Nom, e-mail, photo concernée. Facultatif : message.",
    basis: "Mesures précontractuelles prises à votre demande (art. 6.1.b).",
    duration: "Jusqu’à la mise en vente du tirage, et au plus 1 an.",
  },
  {
    purpose: "Enregistrer une rétractation (formulaire « Renoncer au contrat »)",
    data: "Nom, e-mail, référence et date de la commande. Facultatif : commentaire.",
    basis: "Obligation légale (art. 6.1.c ; art. L221-21 du Code de la consommation).",
    duration: "5 ans (délai de prescription).",
  },
  {
    purpose: "Sécurité du site et lutte contre le spam",
    data: "Adresse IP, navigateur, pages demandées (journaux techniques de l’hébergeur). L’adresse IP sert aussi à limiter le nombre d’envois de formulaires.",
    basis: "Intérêt légitime à sécuriser le site (art. 6.1.f).",
    duration: "Limitation des envois : 10 minutes en mémoire. Journaux : durée courte fixée par l’hébergeur.",
  },
]

export default function ConfidentialitePage() {
  return (
    <LegalPage
      title="Confidentialité"
      intro={<p>Je ne collecte que ce qui est nécessaire pour vous répondre et honorer vos commandes. Aucune donnée n’est vendue, ni utilisée à des fins publicitaires.</p>}
    >
      <h2>Responsable du traitement</h2>
      <p>
        {LEGAL.ownerName} ({LEGAL.brand}), {LEGAL.address} —{" "}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
      </p>

      <h2>Données collectées et finalités</h2>
      <p>
        Les champs obligatoires sont signalés par un astérisque (*) dans chaque formulaire ; sans eux, je ne peux pas
        traiter votre demande. Les autres champs sont facultatifs.
      </p>
      <div className="table-scroll">
        <table>
          <thead>
            <tr><th>Finalité</th><th>Données</th><th>Base légale</th><th>Durée de conservation</th></tr>
          </thead>
          <tbody>
            {TREATMENTS.map((t) => (
              <tr key={t.purpose}><td>{t.purpose}</td><td>{t.data}</td><td>{t.basis}</td><td>{t.duration}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Aucune décision automatisée ni aucun profilage n’est réalisé. Aucun compte client n’est créé sur le site et aucune
        donnée bancaire n’y transite : le paiement se fait via un lien sécurisé du prestataire de paiement, soumis à sa
        propre politique de confidentialité.
      </p>

      <h2>Destinataires et sous-traitants</h2>
      <p>Vos données sont destinées uniquement à {LEGAL.ownerName}. Elles transitent par les prestataires techniques suivants :</p>
      <ul>
        {PROCESSORS.map((p) => (
          <li key={p.name}><strong>{p.name}</strong> — {p.role} <em>Garantie : {p.safeguard}</em></li>
        ))}
      </ul>

      <h2>Vos droits</h2>
      <p>
        Vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation, d’opposition et de portabilité
        de vos données, ainsi que du droit de définir des directives sur leur sort après votre décès. Pour les exercer,
        écrivez à <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a> ; je réponds sous un mois au plus.
      </p>
      <p>
        Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la CNIL
        (<a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer">cnil.fr/fr/plaintes</a>).
      </p>

      <h2 id="cookies">Cookies et traceurs</h2>
      <p>
        <strong>Ce site ne dépose aucun cookie</strong> de mesure d’audience, de publicité ou de réseau social, et n’utilise
        aucun traceur nécessitant votre consentement. C’est pourquoi aucun bandeau cookies ne s’affiche.
      </p>
      <ul>
        <li>Les polices de caractères sont hébergées sur le site lui-même : aucune connexion à Google Fonts.</li>
        <li>
          Les vidéos YouTube ou Vimeo ne sont chargées que si vous cliquez sur « Lire la vidéo ». Ce clic vaut accord pour
          cette vidéo : la plateforme concernée peut alors déposer ses propres cookies, selon sa politique (
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">YouTube / Google</a>,{" "}
          <a href="https://vimeo.com/privacy" target="_blank" rel="noopener noreferrer">Vimeo</a>). Les lecteurs sont
          intégrés en mode « confidentialité renforcée » quand la plateforme le permet.
        </li>
        <li>
          Si un outil de mesure d’audience ou un autre traceur soumis à consentement était ajouté à l’avenir, un bandeau
          vous permettant d’accepter ou de refuser aussi facilement serait mis en place au préalable.
        </li>
      </ul>

      <h2>Sécurité</h2>
      <p>
        Le site est servi exclusivement en HTTPS. Les formulaires sont protégés contre les envois automatisés et les
        informations de commande (prix, stock) sont toujours vérifiées côté serveur.
      </p>

      <p>Voir aussi : <Link href="/mentions-legales">mentions légales</Link>, <Link href="/cgu">conditions d’utilisation</Link>.</p>
    </LegalPage>
  )
}
