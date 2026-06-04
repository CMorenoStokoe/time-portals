import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { lim } from '../models/lim.js'
import { Agent, GraphState } from '../types.js'
import z from 'zod'

// Select the highest quality image
export const selector: Agent = async (state: GraphState) =>
	await lim
		.withStructuredOutput(
			z
				.number()
				.describe(
					'The single image ID which is highest quality. Images are presented in ID order and start from 1. For example: 3.',
				),
		)
		.invoke([
			new SystemMessage(
				'Select the highest quality image that displays the landmark during the chosen period in history in an interesting and accurate manner',
			),
			new HumanMessage({
				content: [
					{
						type: 'text',
						text: `Location context: ${state.request.locationName} during ${state.research.eventName} (${state.research.eventYear})`,
					},
					[1, 2, 3, 4]
						.map((id) => ({
							id,
							type: 'image_url',
							// @ts-expect-error - TS doesn't recognise id is in scope
							image_url: state[`imageGen${id}`],
						}))
						.filter(({ image_url }) => image_url),
				],
			}),
		])
		.then(({ text }) => {
			return { selection: parseInt(text) }
		})
