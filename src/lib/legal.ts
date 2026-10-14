/**
 * Informations légales de l'éditeur, utilisées par toutes les pages juridiques.
 * Les valeurs entre crochets sont À COMPLÉTER avant la mise en ligne.
 */
export const LEGAL = {
  brand: "Carlito Laf Visuel",
  ownerName: "Charles Lafiandra",
  status: "[À COMPLÉTER : statut — ex. Entrepreneur individuel (micro-entreprise) / artiste-auteur]",
  siret: "[À COMPLÉTER : n° SIRET]",
  address: "[À COMPLÉTER : adresse postale professionnelle ou de domiciliation]",
  email: "contact@carlitolafvisuel.com",
  contactEmail: "charleslaf.photo@gmail.com",
  phone: "[À COMPLÉTER : téléphone]",
  vat: "TVA non applicable, article 293 B du Code général des impôts",
  publicationDirector: "Charles Lafiandra",
  website: "https://carlitolafvisuel.com",

  host: {
    name: "Vercel Inc.",
    address: "340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis",
    website: "https://vercel.com",
  },

  mediator: {
    name: "[À COMPLÉTER : nom du médiateur de la consommation]",
    address: "[À COMPLÉTER : adresse du médiateur]",
    website: "[À COMPLÉTER : site internet du médiateur]",
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
    name: "Sanity AS (Norvège)",
    role: "Gestion du contenu du site (textes, photos). Aucune donnée des visiteurs n'y est stockée.",
    safeguard: "Pays reconnu adéquat (Espace économique européen).",
  },
] as const
