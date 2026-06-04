// Researcher node factor which researches a location
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { llm } from '../models/llm.js'
import { z } from 'zod'
import type { GraphState, Research } from '../types.js'

// Define schema structure for output
const EventFeatureSchema = z.object({
	highlightName: z
		.string()
		.describe(
			'A specific architectural, topographical, or object feature relevant to the event',
		),
	visualDescription: z
		.string()
		.describe(
			'A detailed visual description of the feature, including period-accurate materials, lighting, and topography, which will be used to construct the image generation prompt',
		),
	popoverText: z
		.string()
		.describe(
			'A brief one-sentence interesting description or fact of the feature which will be displayed to the user as a pop-out',
		),
})
const ResearchSchema = z.object({
	location: z.string().describe('The input request location to research'),
	eventName: z
		.string()
		.describe(
			'The name of an interesting event or period to explore for this location',
		),
	eventYear: z.number().describe('The year the event occurred'),
	eventHighlights: z
		.array(EventFeatureSchema)
		.describe(
			'Exactly three key architectural, topographical, or object features relevant to the event that will make a compelling image of the event',
		),
})

// Rules
const rules = [
	'Do NOT include any features which not be visible in the current viewpoint',
]

// Researcher node
export const researcher = async (state: GraphState) =>
	await llm
		.withStructuredOutput(ResearchSchema)
		.invoke([
			new SystemMessage(
				'Research the input location in order to identify and detail the single most interesting event or period in its history. It must not be a modern day event, and must significantly change the landscape or visual presentation of the location compared to its modern day view.' +
					+'Follow these rules:' +
					rules.join(),
			),
			new HumanMessage(state.request.locationName),
		])
		.then((research: Research) => {
			console.log('Researcher', research) // Log preview of research output
			return { research }
		})
