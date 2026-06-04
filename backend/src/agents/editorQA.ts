import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { lim } from '../models/lim.js'
import { Agent, GraphState } from '../types.js'

// Define requirements for a pass
const requirements = [
	'The image MUST NOT include any remnants of the Google Street View UI (e.g. navigation arrows, labels, etc.)',
	'The image MUST have the exact same perspective as the base "baseImg" second image',
	'The image MUST reflect the historical event/period specified',
	'The image MUST be a high-resolution image with clear, discernable features (i.e. not blurry or pixelated)',
]

// Edits an existing image to add new feature(s)
export const editor: Agent = async (state: GraphState) => {
	const currentGen = state.imageGen1
		? 1
		: state.imageGen2
			? 2
			: state.imageGen3
				? 3
				: 4
	return await lim
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
						image_url: state[`imageGen${currentGen}`], // First gen image
					},
					{
						id: 'baseImg',
						type: 'image_url',
						image_url: state.request.baseImageUrl,
					},
				],
			}),
		])
		.then(({ content }) => {
			// @ts-expect-error - LangChain does not yet properly type this response
			const inlineData = content[0]?.inlineData
			const { data, mimeType } = inlineData
			return { [`imageGen${currentGen + 1}`]: data }
		})
}
