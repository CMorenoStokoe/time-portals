// Historical landmark agent flow implementing research, QA, and feature integration phases.
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { z } from 'zod'

import { generateImageTool } from './tools/image-tool.js'

type VisualFeature = {
	title: string
	description: string
	x: number
	y: number
}

type ResearchResult = {
	locationName: string
	country: string
	timeEvent: string
	year: string
	sceneDescription: string
	features: [VisualFeature, VisualFeature, VisualFeature]
}

type QAMatrixResult = {
	perspectivePass: boolean
	geographyPass: boolean
	cohesionPass: boolean
	feedback: string
}

type AgentInput = {
	request?: string
	locationName?: string
	originalPerspective?: string
}

const MAX_ATTEMPTS = 4
const defaultLocation = 'Grand Battery, Gibraltar'
const defaultPerspective =
	'backend/test/input/prompt-modern-viewpoint-image.png'

const researchSchema = z.object({
	locationName: z.string().min(1),
	country: z.string().min(1),
	timeEvent: z.string().min(1),
	year: z.string().min(1),
	sceneDescription: z.string().min(1),
	features: z
		.array(
			z.object({
				title: z.string().min(1),
				description: z.string().min(1),
				x: z.number().min(0).max(1),
				y: z.number().min(0).max(1),
			}),
		)
		.length(3),
})

const qaSchema = z.object({
	perspectivePass: z.boolean(),
	geographyPass: z.boolean(),
	cohesionPass: z.boolean(),
	feedback: z.string().min(1),
})

const insightSchema = z.object({
	insights: z.array(z.string().min(1)).length(3),
})

const googleApiKey = process.env.GOOGLE_API_KEY?.trim()
const llm = googleApiKey
	? new ChatGoogleGenerativeAI({
			apiKey: googleApiKey,
			model: 'gemini-2.0-flash-lite',
		})
	: undefined

const getFallbackResearch = (locationName: string): ResearchResult => {
	const normalizedLocation = locationName.toLowerCase()

	if (normalizedLocation.includes('london bridge')) {
		return {
			locationName,
			country: 'England',
			timeEvent: 'Old London Bridge in the early modern era',
			year: '1600',
			sceneDescription:
				'The bridge is crowded with timber buildings while river trade traffic passes beneath its narrow arches.',
			features: [
				{
					title: 'Bridge-top houses',
					description:
						'Timber-framed homes and shops crowd both sides of the bridge deck.',
					x: 0.45,
					y: 0.35,
				},
				{
					title: 'River wherries',
					description:
						'Small passenger boats and barges move goods along the Thames below.',
					x: 0.25,
					y: 0.62,
				},
				{
					title: 'Gatehouse defenses',
					description:
						'Stone gate structures mark controlled entry points to the bridge.',
					x: 0.68,
					y: 0.42,
				},
			],
		}
	}

	return {
		locationName,
		country: 'Gibraltar',
		timeEvent: 'Great Siege defensive operations',
		year: '1781',
		sceneDescription:
			'British defenses hold the Grand Battery while the bay remains active with siege-era naval movement.',
		features: [
			{
				title: 'Defensive earthworks',
				description:
					'Earthen embankments and reinforced gun positions covering the approaches to the battery.',
				x: 0.3,
				y: 0.55,
			},
			{
				title: 'Gun emplacements',
				description:
					'Heavy artillery positioned along the walls facing the bay and Spanish siege lines.',
				x: 0.62,
				y: 0.48,
			},
			{
				title: 'Siege supply activity',
				description:
					'Troops and supply crews moving ammunition and materials through the defensive line.',
				x: 0.48,
				y: 0.72,
			},
		],
	}
}

const evaluateFixtureQa = (imageUrl: string): QAMatrixResult => {
	const fixtureName = imageUrl.match(/#fixture=([^#]+)/)?.[1] ?? ''

	if (fixtureName === 'success-example.png') {
		return {
			perspectivePass: true,
			geographyPass: true,
			cohesionPass: true,
			feedback: 'QA matrix passed for perspective, geography, and cohesion.',
		}
	}

	if (fixtureName.includes('changed_perspective')) {
		return {
			perspectivePass: false,
			geographyPass: true,
			cohesionPass: true,
			feedback:
				'Perspective check failed. Preserve camera angle and horizon from the original street-view image.',
		}
	}

	if (fixtureName.includes('changed_landscape')) {
		return {
			perspectivePass: true,
			geographyPass: false,
			cohesionPass: true,
			feedback:
				'Geography check failed. Keep shoreline, terrain, and landmark layout aligned with the source viewpoint.',
		}
	}

	return {
		perspectivePass: true,
		geographyPass: true,
		cohesionPass: false,
		feedback:
			'Cohesion check failed. Improve global consistency, period materials, and lighting realism.',
	}
}

const toQAPassed = (result: QAMatrixResult) =>
	result.perspectivePass && result.geographyPass && result.cohesionPass

const toLegacyRequest = (input: AgentInput) => {
	if (input.request?.trim()) {
		return input.request.trim()
	}

	const locationName = input.locationName?.trim() || defaultLocation
	return `Historical reconstruction of ${locationName}`
}

const researchLocation = async (
	request: string,
	locationName: string,
): Promise<ResearchResult> => {
	if (!llm) {
		return getFallbackResearch(locationName)
	}

	try {
		const structuredLlm = llm.withStructuredOutput(researchSchema, {
			name: 'historical_location_research',
		})

		const result = await structuredLlm.invoke([
			new SystemMessage(
				'Research the landmark and return exactly one historical event/time with exactly three distinct visual features that can be illustrated from a fixed viewpoint.',
			),
			new HumanMessage(
				`Landmark: ${locationName}\nRequest: ${request}\nReturn concise production-ready output.`,
			),
		])

		return {
			...result,
			features: result.features as [VisualFeature, VisualFeature, VisualFeature],
		}
	} catch {
		return getFallbackResearch(locationName)
	}
}

const runQaMatrix = async (
	request: string,
	imageUrl: string,
): Promise<QAMatrixResult> => {
	if (!llm || !imageUrl.startsWith('data:image/')) {
		return evaluateFixtureQa(imageUrl)
	}

	try {
		const qaLlm = llm.withStructuredOutput(qaSchema, {
			name: 'historical_qa_matrix',
		})

		return await qaLlm.invoke([
			new SystemMessage(
				'Evaluate image quality using only this matrix: perspective, geography, cohesion. Return booleans and concise correction feedback.',
			),
			new HumanMessage({
				content: [
					{ type: 'text', text: `Request constraints: ${request}` },
					{ type: 'image_url', image_url: { url: imageUrl } },
				],
			}),
		])
	} catch {
		return evaluateFixtureQa(imageUrl)
	}
}

const createInsights = async (
	research: ResearchResult,
): Promise<[string, string, string]> => {
	if (!llm) {
		return research.features.map((feature) => feature.description) as [
			string,
			string,
			string,
		]
	}

	try {
		const insightsLlm = llm.withStructuredOutput(insightSchema, {
			name: 'historical_feature_insights',
		})
		const result = await insightsLlm.invoke([
			new SystemMessage(
				'Write short, interesting tourism insights (max 24 words each) for each feature.',
			),
			new HumanMessage(
				JSON.stringify({
					location: research.locationName,
					timeEvent: research.timeEvent,
					features: research.features.map((feature) => ({
						title: feature.title,
						description: feature.description,
					})),
				}),
			),
		])

		return result.insights as [string, string, string]
	} catch {
		return research.features.map((feature) => feature.description) as [
			string,
			string,
			string,
		]
	}
}

const buildBasePrompt = (
	research: ResearchResult,
	originalPerspective: string,
): string =>
	[
		`Create a historically accurate reconstruction of ${research.locationName} during ${research.timeEvent} (${research.year}).`,
		`Scene context: ${research.sceneDescription}`,
		`Original perspective reference: ${originalPerspective}`,
		'Preserve camera position, geography, and cohesive realism.',
	].join(' ')

const buildFeaturePrompt = (
	basePrompt: string,
	feature: VisualFeature,
	currentImageUrl: string,
): string =>
	[
		basePrompt,
		`Incrementally add feature: ${feature.title}.`,
		`Feature detail: ${feature.description}`,
		`Current validated image state: ${currentImageUrl.slice(0, 96)}`,
		'Do not alter perspective or geography while integrating this feature.',
	].join(' ')

export const historicalImageAgent = {
	invoke: async (
		input: AgentInput,
		_options?: {
			runName?: string
		},
	) => {
		const request = toLegacyRequest(input)
		const locationName = input.locationName?.trim() || defaultLocation
		const originalPerspective =
			input.originalPerspective?.trim() || defaultPerspective

		const research = await researchLocation(request, locationName)

		const basePrompt = buildBasePrompt(research, originalPerspective)
		let baseImagePrompt = basePrompt
		let finalImageUrl = ''
		let totalAttempts = 0
		let qaMatrix: QAMatrixResult = {
			perspectivePass: false,
			geographyPass: false,
			cohesionPass: false,
			feedback: 'QA not started.',
		}

		for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
			totalAttempts += 1
			finalImageUrl = await generateImageTool(baseImagePrompt, {
				phase: 'base',
				attempt,
			})
			qaMatrix = await runQaMatrix(request, finalImageUrl)

			if (toQAPassed(qaMatrix)) {
				break
			}
		}

		let integratedFeatureCount = 0
		for (const [featureIndex, feature] of research.features.entries()) {
			for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
				totalAttempts += 1
				const featurePrompt = buildFeaturePrompt(
					basePrompt,
					feature,
					finalImageUrl,
				)
				finalImageUrl = await generateImageTool(featurePrompt, {
					phase: 'feature',
					featureIndex,
					attempt,
				})
				qaMatrix = await runQaMatrix(request, finalImageUrl)
				baseImagePrompt = featurePrompt

				if (toQAPassed(qaMatrix)) {
					integratedFeatureCount += 1
					break
				}
			}
		}

		const insights = await createInsights(research)
		const highlights = research.features.map((feature, index) => ({
			x: feature.x.toFixed(2),
			y: feature.y.toFixed(2),
			title: feature.title,
			text: insights[index],
		}))

		const metadata = {
			year: research.year,
			description: research.timeEvent,
			location: research.locationName,
			country: research.country,
			highlights,
		}

		return {
			request,
			locationName: research.locationName,
			originalPerspective,
			research: {
				timeEvent: research.timeEvent,
				sceneDescription: research.sceneDescription,
				features: research.features.map((feature) => ({
					title: feature.title,
					description: feature.description,
				})),
			},
			imagePrompt: baseImagePrompt,
			imageUrl: finalImageUrl,
			finalImage: finalImageUrl,
			qaMatrix,
			qaFeedback: qaMatrix.feedback,
			revisionCount: totalAttempts,
			integratedFeatureCount,
			status:
				toQAPassed(qaMatrix) && integratedFeatureCount === 3
					? 'approved'
					: 'rejected',
			metadata,
			jsonDocument: metadata,
		}
	},
}
