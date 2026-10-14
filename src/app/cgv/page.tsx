import type { Metadata } from "next"
import Link from "next/link"
import LegalPage from "@/components/legal/LegalPage"
import { LEGAL, mediatorSentence } from "@/lib/legal"

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description: "Conditions de vente des tirages Fine Art et des prestations photo et vidéo de Carlito Laf Visuel.",
}

export default function CgvPage() {
  return (
    <LegalPage
      title="Conditions de vente"
      intro={<p>Tirages Fine Art et prestations photo / vidéo vendus par {LEGAL.ownerName} ({LEGAL.brand}).</p>}
    >
      <h2>1. Champ d’application</h2>
      <p>
        Les présentes conditions générales de vente (CGV) s’appliquent à toute vente conclue entre {LEGAL.ownerName},{" "}
        {LEGAL.status}, SIRET {LEGAL.siret}, {LEGAL.address} (le « Vendeur ») et toute personne passant commande (le «
        Client ») : tirages photographiques (section A) et prestations de photographie et de vidéo (section B). Le Client
        déclare les avoir lues et acceptées avant toute commande.
      </p>

      <h2>2. Prix</h2>
      <p>
        Les prix sont indiqués en euros, toutes taxes comprises. {LEGAL.vat}. Les frais de livraison éventuels sont
        indiqués avant la validation de la commande. Le prix applicable est celui affiché au jour de la commande.
      </p>

      <h2>A. Tirages photographiques</h2>

      <h3>A1. Commande</h3>
      <p>Le Client choisit un tirage, son format et la quantité depuis la boutique, accepte les présentes CGV, puis règle sa commande via le lien de paiement sécurisé Stripe. <strong>Le contrat est conclu au moment du paiement.</strong> Une confirmation de commande récapitulant le produit, le prix total et le délai de livraison est envoyée par e-mail.</p>

      <h3>A2. Paiement</h3>
      <p>Le prix est payable <strong>en totalité à la commande</strong>, par carte bancaire via le service de paiement sécurisé Stripe. Aucune donnée bancaire ne transite par le site. La commande est préparée après encaissement.</p>

      <h3>A3. Livraison</h3>
      <p>
        Livraison en {LEGAL.shipping.zone} uniquement. Le tirage étant réalisé à la commande, il est expédié et livré
        dans un délai de <strong>{LEGAL.shipping.delay}</strong> à compter du paiement (art. L216-1 du Code de la
        consommation). En cas
        de retard, le Client peut résoudre le contrat dans les conditions des articles L216-6 et suivants. Le Client
        vérifie le colis à réception et signale toute avarie au transporteur et au Vendeur dans les meilleurs délais.
      </p>

      <h3>A4. Éditions limitées</h3>
      <p>Les tirages en édition limitée sont numérotés et signés ; le nombre d’exemplaires annoncé, tous formats confondus sauf mention contraire, ne sera jamais dépassé. Un certificat d’authenticité est joint lorsque le produit l’indique.</p>

      <h2 id="retractation">3. Droit de rétractation</h2>
      <p>
        Le Client consommateur dispose d’un délai de <strong>14 jours</strong> pour se rétracter, sans avoir à se
        justifier ni à payer de pénalité. Ce délai court à compter de la réception du tirage (section A) ou de la
        conclusion du contrat (section B).
      </p>
      <p>Pour exercer ce droit, le Client peut au choix :</p>
      <ul>
        <li>utiliser la fonction de rétractation en ligne : <Link href="/retractation">« Renoncer au contrat ici »</Link>, accessible depuis le pied de chaque page — un accusé de réception lui est envoyé immédiatement par e-mail ;</li>
        <li>envoyer une déclaration dénuée d’ambiguïté par e-mail à <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a> ou par courrier, par exemple au moyen du modèle ci-dessous.</li>
      </ul>
      <p>
        <strong>Retour des tirages :</strong> le Client renvoie le tirage, dans son emballage de protection, au plus tard
        14 jours après avoir communiqué sa décision. Les frais de retour sont à sa charge. Sa responsabilité peut être
        engagée en cas de dépréciation résultant de manipulations autres que celles nécessaires pour constater la nature
        et les caractéristiques du bien.
      </p>
      <p>
        <strong>Remboursement :</strong> le Vendeur rembourse la totalité des sommes versées, y compris les frais de
        livraison initiaux (sur la base du mode de livraison standard), au plus tard 14 jours après avoir été informé de
        la rétractation, par le même moyen de paiement. Pour les tirages, il peut différer le remboursement jusqu’à
        récupération du bien ou preuve de son expédition. Détails : <Link href="/remboursement">retours et remboursements</Link>.
      </p>
      <p><strong>Exceptions (art. L221-28 du Code de la consommation) :</strong> le droit de rétractation ne peut pas être exercé pour :</p>
      <ul>
        <li>les tirages confectionnés selon les spécifications du Client ou nettement personnalisés (format, papier, encadrement ou recadrage sur mesure, dédicace personnalisée) ;</li>
        <li>les prestations pleinement exécutées avant la fin du délai, lorsque leur exécution a commencé après accord préalable exprès du Client et renoncement exprès à son droit de rétractation ;</li>
        <li>les fichiers numériques fournis sur support immatériel, lorsque leur fourniture a commencé avec l’accord préalable exprès du Client, qui a reconnu perdre son droit de rétractation.</li>
      </ul>
      <p>Si une prestation commence pendant le délai à la demande expresse du Client puis que celui-ci se rétracte, il verse un montant proportionnel au service déjà fourni.</p>

      <h3>Modèle de formulaire de rétractation</h3>
      <p><em>(Veuillez compléter et renvoyer le présent formulaire uniquement si vous souhaitez vous rétracter du contrat.)</em></p>
      <p>
        À l’attention de {LEGAL.ownerName}, {LEGAL.address}, {LEGAL.contactEmail} :<br />
        Je/nous (*) vous notifie/notifions (*) par la présente ma/notre (*) rétractation du contrat portant sur la vente
        du bien (*) / pour la prestation de services (*) ci-dessous :<br />
        Commandé le (*) / reçu le (*) :<br />
        Nom du (des) consommateur(s) :<br />
        Adresse du (des) consommateur(s) :<br />
        Signature du (des) consommateur(s) (uniquement en cas de notification du présent formulaire sur papier) :<br />
        Date :<br />
        (*) Rayez la mention inutile.
      </p>

      <h2>4. Garanties légales</h2>
      <p>
        Les tirages bénéficient de la garantie légale de conformité (art. L217-3 à L217-20 du Code de la consommation)
        et de la garantie des vices cachés (art. 1641 à 1649 du Code civil).
      </p>
      <p>
        Le consommateur dispose d’un délai de deux ans à compter de la délivrance du bien pour obtenir la mise en œuvre
        de la garantie légale de conformité en cas d’apparition d’un défaut de conformité. Durant ce délai, il n’est tenu
        d’établir que l’existence du défaut de conformité et non la date d’apparition de celui-ci. La garantie légale de
        conformité emporte obligation de fournir toutes les mises à jour nécessaires au maintien de la conformité du
        bien. Elle donne au consommateur droit à la réparation ou au remplacement du bien dans un délai de trente jours
        suivant sa demande, sans frais et sans inconvénient majeur pour lui. Si le bien est réparé dans le cadre de la
        garantie légale de conformité, le consommateur bénéficie d’une extension de six mois de la garantie initiale.
        Si le consommateur demande la réparation du bien, mais que le vendeur impose le remplacement, la garantie légale
        de conformité est renouvelée pour une période de deux ans à compter de la date de remplacement du bien. Le
        consommateur peut obtenir une réduction du prix d’achat en conservant le bien ou mettre fin au contrat en se
        faisant rembourser intégralement contre restitution du bien, si : 1° le professionnel refuse de réparer ou de
        remplacer le bien ; 2° la réparation ou le remplacement du bien intervient après un délai de trente jours ; 3°
        la réparation ou le remplacement du bien occasionne un inconvénient majeur pour le consommateur, notamment
        lorsque le consommateur supporte définitivement les frais de reprise ou d’enlèvement du bien non conforme, ou
        s’il supporte les frais d’installation du bien réparé ou de remplacement ; 4° la non-conformité du bien persiste
        en dépit de la tentative de mise en conformité du vendeur restée infructueuse. Le consommateur a également droit
        à une réduction du prix du bien ou à la résolution du contrat lorsque le défaut de conformité est si grave qu’il
        justifie que la réduction du prix ou la résolution du contrat soit immédiate. Le consommateur n’est alors pas
        tenu de demander la réparation ou le remplacement du bien au préalable. Le consommateur n’a pas droit à la
        résolution de la vente si le défaut de conformité est mineur. Toute période d’immobilisation du bien en vue de
        sa réparation ou de son remplacement suspend la garantie qui restait à courir jusqu’à la délivrance du bien
        remis en état. Les droits mentionnés ci-dessus résultent de l’application des articles L. 217-1 à L. 217-32 du
        code de la consommation. Le vendeur qui fait obstacle de mauvaise foi à la mise en œuvre de la garantie légale
        de conformité encourt une amende civile d’un montant maximal de 300 000 euros, qui peut être porté jusqu’à 10 %
        du chiffre d’affaires moyen annuel (article L. 241-5 du code de la consommation). Le consommateur bénéficie
        également de la garantie légale des vices cachés en application des articles 1641 à 1649 du code civil, pendant
        une durée de deux ans à compter de la découverte du défaut. Cette garantie donne droit à une réduction de prix si
        le bien est conservé ou à un remboursement intégral contre restitution du bien.
      </p>

      <h2>B. Prestations photo et vidéo</h2>
      <h3>B1. Devis et commande</h3>
      <p>Chaque prestation fait l’objet d’un devis gratuit et détaillé (date, lieu, durée, livrables, délais de livraison, prix, conditions d’utilisation des images). La prestation est commandée par l’acceptation écrite du devis (signature ou e-mail). <strong>Aucun acompte n’est demandé.</strong></p>
      <h3>B1 bis. Facturation et paiement</h3>
      <p>Une facture est émise à la livraison des fichiers. Elle est payable à réception, par virement ou par lien de paiement sécurisé. Pour les clients professionnels uniquement, tout retard de paiement entraîne des pénalités au taux d’intérêt légal majoré de 10 points et une indemnité forfaitaire de 40 € pour frais de recouvrement (art. L441-10 du Code de commerce).</p>
      <h3>B2. Conditions et report</h3>
      <p>Les prises de vue en mer, à l’eau ou en extérieur dépendent des conditions météorologiques et de sécurité. En cas de conditions impropres ou dangereuses appréciées par le Vendeur, la séance est reportée à une date convenue d’un commun accord, sans frais pour le Client.</p>
      <h3>B3. Annulation par le Client</h3>
      <p>Hors exercice du droit de rétractation, le Client peut annuler une prestation avant sa réalisation en prévenant le Vendeur le plus tôt possible. Aucun acompte n’ayant été versé, l’annulation est sans frais, à l’exception des dépenses déjà engagées à sa demande et prévues au devis (transport, hébergement, location de matériel), qui lui sont alors facturées sur justificatif.</p>
      <h3>B4. Livrables et droits d’utilisation</h3>
      <p>Les fichiers sont livrés par lien de téléchargement dans le délai prévu au devis. Le Vendeur reste titulaire des droits d’auteur ; le Client bénéficie d’une licence d’utilisation dont l’étendue (usages, supports, durée, territoire) est précisée dans le devis. Toute autre utilisation nécessite un accord écrit. Sauf refus exprès du Client, le Vendeur peut présenter les images dans son portfolio et sur ses réseaux.</p>

      <h2>5. Données personnelles</h2>
      <p>Les données nécessaires au traitement de la commande sont traitées conformément à la <Link href="/confidentialite">politique de confidentialité</Link>.</p>

      <h2>6. Réclamations et médiation</h2>
      <p>
        Toute réclamation peut être adressée à <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>. À défaut
        de solution amiable, {mediatorSentence()}
      </p>

      <h2>7. Droit applicable</h2>
      <p>Les présentes CGV sont soumises au droit français. Le consommateur peut saisir, à son choix, la juridiction du lieu où il demeurait au moment de la conclusion du contrat ou de la survenance du fait dommageable.</p>
    </LegalPage>
  )
}
