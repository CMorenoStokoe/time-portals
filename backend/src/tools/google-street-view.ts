import { configDotenv } from 'dotenv'
configDotenv()

// Returns a Google Street View image as a base64 data URI for a given coordinate
export const getStreetView = async (
	lat: number,
	lng: number,
): Promise<string> => {
	const params = new URLSearchParams({
		location: `${lat},${lng}`,
		size: `1920x1080`,
		key: process.env.GOOGLE_MAPS_API_KEY!,
	})
	const url = `https://maps.googleapis.com/maps/api/streetview?${params}`
	const res = await fetch(url)
	if (!res.ok) throw new Error(`Street View fetch failed: ${res.status}`)
	const buffer = await res.arrayBuffer()
	return `data:image/jpeg;base64,${Buffer.from(buffer).toString('base64')}`
}
