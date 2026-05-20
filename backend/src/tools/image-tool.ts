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
}

const currentDir = dirname(fileURLToPath(import.meta.url))
const fixtureDir = resolve(currentDir, '../../test/output')

const toDataUrl = (bytes: Buffer, mimeType: string, fixtureName: string) =>
	`data:${mimeType};base64,${bytes.toString('base64')}#fixture=${fixtureName}`

const createFixtureImage = async (fixtureName: string) => {
	const fixturePath = resolve(fixtureDir, fixtureName)
	const imageBytes = await readFile(fixturePath)
	const mimeType = fixtureName.endsWith('.png') ? 'image/png' : 'image/jpeg'
	return toDataUrl(imageBytes, mimeType, fixtureName)
}

export const generateImageTool = async (
	prompt: string,
	options: ImageToolOptions,
): Promise<string> => {
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
