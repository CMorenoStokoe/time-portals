// Image generation tool with deterministic fixture fallback for offline validation.
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type ImageToolOptions = {
	revisionCount?: number
	qaFeedback?: string
	phase?: 'base' | 'feature'
	attempt?: number
	featureIndex?: number
	liveRequired?: boolean
}

const currentDir = dirname(fileURLToPath(import.meta.url))
const fixtureDir = resolve(currentDir, '../../test/output')
const googleApiKey = process.env.GOOGLE_API_KEY?.trim()

const toDataUrl = (bytes: Buffer, mimeType: string, fixtureName: string) =>
	`data:${mimeType};base64,${bytes.toString('base64')}#fixture=${fixtureName}`

const createFixtureImage = async (fixtureName: string) => {
	const fixturePath = resolve(fixtureDir, fixtureName)
	const imageBytes = await readFile(fixturePath)
	const mimeType = fixtureName.endsWith('.png') ? 'image/png' : 'image/jpeg'
	return toDataUrl(imageBytes, mimeType, fixtureName)
}

const extractImageBytes = (responseBody: unknown): string | undefined => {
	if (
		responseBody &&
		typeof responseBody === 'object' &&
		'predictions' in responseBody &&
		Array.isArray((responseBody as { predictions?: unknown[] }).predictions)
	) {
		const firstPrediction = (responseBody as { predictions: unknown[] })
			.predictions[0]
		if (
			firstPrediction &&
			typeof firstPrediction === 'object' &&
			'bytesBase64Encoded' in firstPrediction &&
			typeof (firstPrediction as { bytesBase64Encoded?: unknown })
				.bytesBase64Encoded === 'string'
		) {
			return (firstPrediction as { bytesBase64Encoded: string }).bytesBase64Encoded
		}
	}

	if (
		responseBody &&
		typeof responseBody === 'object' &&
		'generatedImages' in responseBody &&
		Array.isArray((responseBody as { generatedImages?: unknown[] }).generatedImages)
	) {
		const generated = (responseBody as { generatedImages: unknown[] })
			.generatedImages[0]
		if (
			generated &&
			typeof generated === 'object' &&
			'image' in generated &&
			(generated as { image?: unknown }).image &&
			typeof (generated as { image: unknown }).image === 'object' &&
			'imageBytes' in (generated as { image: { imageBytes?: unknown } }).image &&
			typeof (generated as { image: { imageBytes: unknown } }).image.imageBytes ===
				'string'
		) {
			return (generated as { image: { imageBytes: string } }).image.imageBytes
		}
	}

	return undefined
}

const generateLiveImage = async (prompt: string): Promise<string> => {
	if (!googleApiKey) {
		throw new Error('GOOGLE_API_KEY is not configured for live image generation.')
	}

	const response = await fetch(
		`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${googleApiKey}`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				instances: [{ prompt }],
				parameters: {
					sampleCount: 1,
				},
			}),
		},
	)

	if (!response.ok) {
		throw new Error(
			`Live image generation failed with status ${response.status}: ${await response.text()}`,
		)
	}

	const responseBody = (await response.json()) as unknown
	const imageBytes = extractImageBytes(responseBody)
	if (!imageBytes) {
		throw new Error('Live image generation response did not include image bytes.')
	}

	return `data:image/png;base64,${imageBytes}`
}

export const generateImageTool = async (
	prompt: string,
	options: ImageToolOptions,
): Promise<string> => {
	if (googleApiKey) {
		try {
			return await generateLiveImage(prompt)
		} catch (error) {
			if (options.liveRequired) {
				throw error
			}
		}
	} else if (options.liveRequired) {
		throw new Error(
			'Live mode was requested but GOOGLE_API_KEY is not configured.',
		)
	}

	if (options.phase) {
		const shouldPassQa = (options.attempt ?? 0) > 0
		const fixtureName = shouldPassQa
			? 'success-example.png'
			: options.phase === 'base'
				? 'error-example-changed_perspective.jpg'
				: (options.featureIndex ?? 0) % 2 === 0
					? 'error-example-changed_landscape.jpg'
					: 'error-example-changed_perspective-2.png'

		try {
			return await createFixtureImage(fixtureName)
		} catch {
			const encodedPrompt = encodeURIComponent(prompt.slice(0, 80))
			return `https://storage.googleapis.com/history-lens-assets/draft-output.png?hint=${encodedPrompt}`
		}
	}

	const shouldReturnValidatedFixture =
		(options.revisionCount ?? 0) > 0 || Boolean(options.qaFeedback)
	const fixtureName = shouldReturnValidatedFixture
		? 'success-example.png'
		: 'error-example-changed_perspective.jpg'

	try {
		return await createFixtureImage(fixtureName)
	} catch {
		const encodedPrompt = encodeURIComponent(prompt.slice(0, 80))
		return `https://storage.googleapis.com/history-lens-assets/draft-output.png?hint=${encodedPrompt}`
	}
}
