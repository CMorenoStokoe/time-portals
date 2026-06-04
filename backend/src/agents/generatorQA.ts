// Factory to generate QA node
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { GraphState } from '../types.js'
import { QASchema } from './common/QASchema.js'
import { lim } from '../models/lim.js'

// Define requirements for a pass
const requirements = [
	'The image MUST NOT include any remnants of the Google Street View UI (e.g. navigation arrows, labels, etc.)',
	'The image MUST have the exact same perspective as the base "baseImg" second image',
	'The image MUST reflect the historical event/period specified',
	'The image MUST be a high-resolution image with clear, discernable features (i.e. not blurry or pixelated)',
]

// Factory for QA agents which validate an output against criteria
export const generatorQA = async (state: GraphState) =>
	await lim
		.withStructuredOutput(QASchema)
		.invoke([
			new SystemMessage(
				'Ensure the first "generatedImg" image is congruent with the second "baseImg" image, and meets the following specifications: '.concat(
					requirements.join(),
				),
			),
			new HumanMessage({
				content: [
					{
						type: 'text',
						text: `Location context: ${state.request.locationName} during ${state.research.eventName} (${state.research.eventYear})`,
					},
					{
						id: 'generatedImg',
						type: 'image_url',
						image_url: state.imageGen1, // First gen image
					},
					{
						id: 'baseImg',
						type: 'image_url',
						image_url: state.request.baseImageUrl,
					},
				],
			}),
		])
		.then((generator_QA) => {
			return { generator_QA }
		})
