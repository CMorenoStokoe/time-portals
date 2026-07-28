// Factory to generate QA node
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { EvaluatorGraphState } from './types'
import { llm } from '../cfg/models'
import { evaluatorSchema } from './schema'

// Agent which evaluates the generated image against the base image and requirements
export const evaluatorAgent = async (state: EvaluatorGraphState) =>
	await llm.google.chat
		.withStructuredOutput(evaluatorSchema)
		.invoke([
			new SystemMessage(
				'Evaluate the first "generatedImg" against stated criteria in reference to the second "baseImg" image',
			),
			new HumanMessage({
				content: [
					{
						id: 'generatedImg',
						type: 'image_url',
						image_url: state.request.generatedImg, // First gen image
					},
					{
						id: 'baseImg',
						type: 'image_url',
						image_url: state.request.baseImg,
					},
				],
			}),
		])
		.then((evaluator) => ({ evaluator })) // Return the evaluation result in the graph state
