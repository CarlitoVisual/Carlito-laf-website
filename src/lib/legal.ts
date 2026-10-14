/**
 * Informations légales de l'éditeur, utilisées par toutes les pages juridiques.
 * Modifier ici pour mettre à jour toutes les pages juridiques.
 */
export const LEGAL = {
  brand: "Carlito Laf Visuel",
  ownerName: "Charles Lafiandra",
  status: "Entrepreneur individuel (micro-entreprise)",
  siret: "131 152 183 00011",
  address: "Avenue de Biarritz, 64210 Bidart, France",
  email: "contact@carlitolafvisuel.com",
  contactEmail: "charleslaf.photo@gmail.com",
  phone: "06 51 29 50 12",
  vat: "TVA non applicable, article 293 B du Code général des impôts (micro-entreprise)",
  publicationDirector: "Charles Lafiandra",
  website: "https://carlitolafvisuel.com",

  host: {
    name: "Vercel Inc.",
    address: "340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis",
    website: "https://vercel.com",
  },

  /**
   * Médiateur de la consommation (obligatoire, art. L612-1 C. conso). Laisser `name` vide tant qu'aucun
   * médiateur n'est désigné : les pages affichent alors un texte d'attente.
   */
  mediator: {
    name: "",
    address: "",
    website: "",
  },

  shipping: {
    zone: "France métropolitaine",
    delay: "10 jours",
  },

  /** Date de dernière mise à jour des documents juridiques */
  updatedAt: "14 octobre 2026",
} as const

/** Sous-traitants qui traitent des données personnelles pour le compte de l'éditeur */
export const PROCESSORS = [
  {
    name: "Vercel Inc. (États-Unis)",
    role: "Hébergement du site et journaux techniques (adresse IP, navigateur, pages demandées).",
    safeguard: "Clauses contractuelles types de la Commission européenne / Data Privacy Framework UE–États-Unis.",
  },
  {
    name: "Resend (États-Unis)",
    role: "Acheminement des e-mails envoyés depuis les formulaires du site.",
    safeguard: "Certifié Data Privacy Framework UE–États-Unis.",
  },
  {
    name: "Google (Gmail)",
    role: "Boîte de réception où arrivent vos messages et à partir de laquelle je vous réponds.",
    safeguard: "Clauses contractuelles types / Data Privacy Framework UE–États-Unis.",
  },
  {
    name: "Stripe Payments Europe (Irlande)",
    role: "Paiement en ligne des tirages via un lien de paiement sécurisé. Vos données bancaires sont saisies chez Stripe et ne transitent jamais par ce site.",
    safeguard: "Prestataire établi dans l’Union européenne, agréé comme établissement de paiement.",
  },
  {
    name: "Sanity AS (Norvège)",
    role: "Gestion du contenu du site (textes, photos). Aucune donnée des visiteurs n'y est stockée.",
    safeguard: "Pays reconnu adéquat (Espace économique européen).",
  },
] as const

/** Phrase sur la médiation, adaptée selon qu'un médiateur est désigné ou non. */
export function mediatorSentence(): string {
  const m = LEGAL.mediator
  if (m.name) {
    return `vous pouvez recourir gratuitement au médiateur de la consommation : ${m.name}, ${m.address}, ${m.website}.`
  }
  return "vous pourrez recourir gratuitement à un médiateur de la consommation, dont les coordonnées seront indiquées ici dès sa désignation. En attendant, écrivez-moi : je m’engage à rechercher une solution amiable."
}
