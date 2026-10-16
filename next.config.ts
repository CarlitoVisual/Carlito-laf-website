import type { NextConfig } from "next"

const isDev = process.env.NODE_ENV !== "production"
// La barre d'outils Vercel (commentaires) n'est injectée que sur les préversions
const isPreview = process.env.VERCEL_ENV === "preview"
const vercelLive = isPreview ? " https://vercel.live https://*.pusher.com wss://*.pusher.com" : ""

/**
 * Politique de sécurité du contenu : n'autorise que les ressources réellement utilisées par le site
 * (Sanity pour les images/vidéos, YouTube/Vimeo pour les lecteurs chargés après clic).
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}${isPreview ? " https://vercel.live" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://cdn.sanity.io${isPreview ? " https://vercel.live https://vercel.com" : ""}`,
  "media-src 'self' blob: https://cdn.sanity.io",
  `font-src 'self' data:${isPreview ? " https://vercel.live" : ""}`,
  `connect-src 'self'${isDev ? " ws: wss:" : ""}${vercelLive}`,
  `frame-src https://www.youtube-nocookie.com https://www.youtube.com https://player.vimeo.com${isPreview ? " https://vercel.live" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ")

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Redimensionnement par le CDN Sanity (voir src/lib/sanityImageLoader.ts)
    loader: "custom",
    loaderFile: "./src/lib/sanityImageLoader.ts",
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // L'aperçu de devis contient une clé d'accès dans l'URL : jamais transmise en Referer, jamais mise en cache
      {
        source: "/devis/apercu/:path*",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Cache-Control", value: "private, no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ]
  },
}

export default nextConfig
