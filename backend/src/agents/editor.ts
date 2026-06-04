import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { lim } from '../models/lim.js'
import { Agent, GraphState } from '../types.js'

// Define rules for image generation
const rules = [
	'Do NOT change the perspective of the image',
	'Do NOT remove previously added features',
	'DO ensure the new feature is added in a visually coherent way with the existing image',
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
				`Add the following feature to a previously generated historical view. Follow these rules strictly: ${rules.join()}`,
			),
			new HumanMessage({
				content: [
					{
						type: 'text',
						text: `Feature to add: ${state.research.eventHighlights[currentGen - 1]?.highlightName}. ${state.research.eventHighlights?.[currentGen - 1]?.visualDescription}`,
					},
					{
						type: 'image_url',
						image_url: state[`imageGen${currentGen}`],
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
