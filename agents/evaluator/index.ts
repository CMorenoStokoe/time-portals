// Entrypoint that runs the historical image graph.
import { configDotenv } from 'dotenv'
configDotenv()
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { AppMetadata, Request } from './types.js'
import { graph } from './graph.js'
import { langsmithConfig } from '../cfg/langsmith'

// Configure settings
langsmithConfig()

const baseImageDataUrl = `data:image/png;base64,${readFileSync('test/input/prompt-modern-viewpoint-image.png', 'base64')}`
const request: Request = {
	locationName: 'Gibraltar pillars of hercules viewpoint',
	xCoord: 36.144703,
	yCoord: -5.353588,
	// heading: 0, // Heading for orienting street view to the landmark
	referenceBase: 'Google Street View',
	baseImageUrl: baseImageDataUrl,
}

// Run the model
export const evaluator: Agent.Run = async (request: Agent.Request) =>
	await graph
		.compile()
		.invoke(
			{ request },
			{
				callbacks: [
					{
						handleChainStart: (chain) =>
							progress.update(chain?.name), // progress.update(chain?.kwargs?.name),
					},
				],
			},
		)
		.then((finalState) => {
			// Construct directory for saving outputs
			const [date, time] = new Date()
				.toISOString()
				.replace(/:/g, '-')
				.split('T')
			const [year, month, day] = date.split('-')
			const outputDir = `output/${year}/${month}/${day}/${time}`
			mkdirSync(outputDir, { recursive: true })
			// Save outputs
			const finalStateNoImages = {
				...finalState,
				request: { ...finalState.request, baseImageUrl: 1 },
				generations: Object.fromEntries(
					Object.entries(finalState).filter(
						(key) => !key.includes('mage'),
					),
				),
			}
			writeFileSync(
				`${outputDir}/raw.json`,
				JSON.stringify(finalStateNoImages, null, 2),
			) // Raw output
			const meta: AppMetadata = {
				year: finalState.research.eventYear,
				description: finalState.baseImageDescription,
				country: 'Gibraltar',
				location: finalState.research.location,
				highlights: finalState.research.eventHighlights.map((d) => ({
					x: 0, // d.popoverLocationX,
					y: 0, // d.popoverLocationY,
					text: d.popoverText,
				})),
			}
			writeFileSync(
				`${outputDir}/meta.json`,
				JSON.stringify(meta, null, 2),
			) // Metadata
			writeFileSync(
				`${outputDir}/scene-v0.png`,
				finalState.request.baseImageUrl!,
				'base64',
			) // Base images
			Array(4).forEach((_, i) =>
				writeFileSync(
					`${outputDir}/scene-v${i + 1}.png`,
					// @ts-expect-error - TS doesn't recognise i is in-range
					finalState[`imageGen${i + 1}`],
					'base64',
				),
			) // Generated images
			// End
			betterConsole.log('AGENT', 'Successfully executed pipeline')
			process.exitCode = 0
			progress.stop()
		})
		.catch((error) => {
			console.error('Pipeline execution failed:', error)
			process.exitCode = 1
		})
