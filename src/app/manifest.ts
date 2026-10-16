import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CarlitoLaf Visuel",
    short_name: "CarlitoLaf",
    description: "Photographe et vidéaste — sports nautiques, aventure et paysages au Pays basque.",
    start_url: "/",
    display: "standalone",
    background_color: "#051B2E",
    theme_color: "#051B2E",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  }
}
