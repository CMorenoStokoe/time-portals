import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { lim } from '../models/lim.js'
import { Agent, GraphState } from '../types.js'

// Describes the contents of an image in text for LLM inference
export const describer: Agent = async (state: GraphState) =>
	await lim
		.invoke([
			new SystemMessage(
				'Briefly describe the image perspective, including orientation/heading, what is visible, and what is occluded.',
			),
			new HumanMessage({
				content: [
					{
						type: 'text',
						text: `Location context: ${state.request.locationName}`,
					},
					{
						type: 'image_url',
						image_url: state.request.baseImageUrl,
					},
				],
			}),
		])
		.then(({ text }) => {
			return { baseImageDescription: text }
		})
