/** Point de départ des déplacements : Bidart. */
const BASE = { lat: 43.4372, lon: -1.5911 }
/** Facteur moyen route / vol d'oiseau. */
const ROAD_FACTOR = 1.3

function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/**
 * Estime la distance routière aller (km) depuis Bidart vers un lieu en France,
 * via le service de géocodage de l’IGN (Géoplateforme, Base Adresse Nationale, service public gratuit).
 * Retourne null si le lieu n'est pas trouvé avec assez de confiance.
 */
export async function estimateDistanceKm(place: string): Promise<{ km: number; label: string } | null> {
  const q = place.trim()
  if (q.length < 3) return null
  try {
    const url = `https://data.geopf.fr/geocodage/search/?q=${encodeURIComponent(q)}&limit=1&type=municipality`
    const res = await fetch(url, { signal: AbortSignal.timeout(3000), cache: "no-store" })
    if (!res.ok) return null
    const data = (await res.json()) as { features?: { geometry: { coordinates: [number, number] }; properties: { score: number; label: string } }[] }
    const f = data.features?.[0]
    if (!f || f.properties.score < 0.5) return null
    const [lon, lat] = f.geometry.coordinates
    return { km: Math.round(haversineKm(BASE, { lat, lon }) * ROAD_FACTOR), label: f.properties.label }
  } catch {
    return null
  }
}
