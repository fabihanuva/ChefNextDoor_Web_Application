import 'server-only'

/**
 * Converts a street address into latitude/longitude using OpenStreetMap's
 * free Nominatim geocoding API — no API key required, which keeps this
 * project free to run. Rate-limited to ~1 request/second by Nominatim's
 * usage policy, which is fine for a course project's traffic but would
 * need a paid provider (Google Maps Geocoding API, Mapbox) at real scale.
 */
export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
      address
    )}`
    const res = await fetch(url, {
      headers: {
        // Nominatim's usage policy requires a descriptive User-Agent
        'User-Agent': 'ChefNextDoor-CourseProject/1.0',
      },
    })

    if (!res.ok) return null
    const data = await res.json()
    if (!data?.[0]) return null

    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch {
    return null
  }
}

/**
 * Straight-line ("as the crow flies") distance between two coordinates,
 * in kilometers. Not actual road distance, but a reasonable and free
 * approximation for delivery-fee purposes.
 */
export function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
