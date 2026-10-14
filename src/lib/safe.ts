/**
 * Petits utilitaires de sécurité partagés.
 */

/**
 * N'accepte que les liens sûrs saisis dans le CMS : chemins internes (/…, #…, ?…),
 * http(s), mailto: et tel:. Tout le reste (javascript:, data:, vbscript:…) est remplacé
 * par la valeur de repli.
 */
export function safeHref(href: string | null | undefined, fallback = "#"): string {
  if (typeof href !== "string") return fallback
  const h = href.trim()
  if (!h) return fallback
  if (/^(\/(?!\/)|#|\?)/.test(h)) return h
  // Supprime les caractères de contrôle/espaces qu'un navigateur ignorerait (ex. "java\tscript:")
  const normalized = h.replace(/[\u0000- \u007f-\u009f]/g, "").toLowerCase()
  if (/^(https?:|mailto:|tel:)/.test(normalized)) return h
  // Lien relatif sans schéma (ex. "contact") : accepté s'il ne contient pas de ":" avant le premier "/"
  if (!/^[^/?#]*:/.test(normalized) && !h.startsWith("//")) return h
  return fallback
}

/** Supprime ce qui ressemble à un lien ou à un nom de domaine (pour les e-mails envoyés à une adresse saisie par l'internaute). */
export function stripLinks(s: string): string {
  return s
    .replace(/[a-z][a-z0-9+.-]*:\/\/\S*/gi, "[lien retiré]")
    .replace(/\bwww\.\S+/gi, "[lien retiré]")
    .replace(/\b[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}\b\S*/gi, "[lien retiré]")
}

/** Texte libre : chaîne nettoyée et tronquée, chaîne vide sinon. */
export function cleanText(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : ""
}
