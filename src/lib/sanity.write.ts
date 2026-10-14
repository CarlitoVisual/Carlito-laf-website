import { createClient } from "next-sanity"

/**
 * Client Sanity en écriture, utilisé uniquement côté serveur (création des brouillons de devis).
 * Nécessite la variable d'environnement SANITY_API_WRITE_TOKEN (jeton « Editor »).
 */
export const writeClient = process.env.SANITY_API_WRITE_TOKEN
  ? createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
      apiVersion: "2025-01-01",
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
    })
  : null
