import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo"

/**
 * robots.txt — en production : tout est ouvert sauf l'API et les aperçus de devis.
 * Sur les préversions Vercel (*.vercel.app), on bloque tout pour éviter le contenu dupliqué.
 */
export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
    return { rules: { userAgent: "*", disallow: "/" } }
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/devis/apercu/", "/boutique/merci"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
