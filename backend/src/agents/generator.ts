// Generator node factory that creates prompts and calls image generation
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { lim } from '../models/lim.js'
import { GraphState } from '../types.js'

// Define rules for image generation
const rules = [
	'Do NOT change the perspective of the image',
	'Do NOT alter geography (unless there is a clear historical reason)',
	'DO ensure the new image is historically accurate for the event/period in question',
]

// Generate a historical image of a modern day view-point
export const generator = async (state: GraphState) =>
	await lim
		.invoke([
			new SystemMessage(
				`Transform this modern day google street view to show how it would have looked in a given historical event/period.
			Follow these rules explicity: ${rules.join()}`,
			),
			new HumanMessage({
				content: [
					{
						type: 'text',
						text: `${state.request.locationName} during the ${state.research.eventName} of ${state.research.eventYear}`,
					},
					{
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
			return { generations: [data] }
		})
