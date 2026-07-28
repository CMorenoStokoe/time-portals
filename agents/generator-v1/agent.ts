// Factory to generate QA node
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { GeneratorV1GraphState } from './types'
import { llm } from '../cfg/models'
import { generatorV1Schema, metadataSchema } from './schema'

// Agent which evaluates the generated image against the base image and requirements
export const generatorV1Agent = async (state: GeneratorV1GraphState) =>
	await llm.google.image
		// .withStructuredOutput(generatorV1Schema)
		.invoke([
			new SystemMessage(
				'Create a modern photograph as if it were taken at the time of this historical scene. It should be full-color and high-resolution. Remove any text, logos, designs, frames, and blemishes which would not belong in a digital photograph.',
			),
			new HumanMessage({
				content: [
					{
						id: 'image',
						type: 'image_url',
						image_url: state.request.image_url, // Historical reference image to bring to life
					},
				],
			}),
		])
		.then((result) => {
			// Ensure first item is the image
			const generation = result
			if (Array.isArray(generation.content)) {
				const imageIndex = generation.content.findIndex(
					(part) => part.type === 'inlineData',
				)
				generation.content.unshift(
					generation.content.splice(imageIndex, 1)[0],
				)
			}
			console.log('Generator complete. Replies:', result.content.length)
			return { generation } // Return the evaluation result in the graph state
		})

// Agent which evaluates the generated image against the base image and requirements
export const evaluatorAgent = async (state: GeneratorV1GraphState) =>
	await llm.google.chat
		.withStructuredOutput(generatorV1Schema)
		.invoke([
			new SystemMessage(
				'Evaluate the first "generatedImg" against stated criteria in reference to the second "baseImg" image',
			),
			new HumanMessage({
				content: [
					{
						id: 'generatedImg',
						type: 'image_url',
						image_url: `data:${state.generation.content[0].inlineData.mimeType};base64,${state.generation.content[0].inlineData.data}`, // First gen image must be a full data URL
					},
					{
						id: 'baseImg',
						type: 'image_url',
						image_url: state.request.image_url,
					},
				],
			}),
		])
		.then((evaluation) => {
			console.log('Evaluation complete. Score:', evaluation.score)
			return { evaluation } // Return the evaluation result in the graph state
		})

// Agent which adds metadata including year, location and coordinates
export const metadataAgent = async (state: GeneratorV1GraphState) =>
	await llm.google.chat
		.withStructuredOutput(metadataSchema)
		.invoke([
			new SystemMessage(
				'Add metadata for this image based on what you can see in these images. Both images are of the same location so use details from both, but prioritise concrete details in the baseImg.' +
					'Use any provided metadata for additional details:' +
					JSON.stringify(state.request.metadata ?? {}),
			),
			new HumanMessage({
				content: [
					{
						id: 'baseImg',
						type: 'image_url',
						image_url: state.request.image_url,
					},
				],
			}),
		])
		.then((metadata) => {
			console.log(
				'Metadata complete. Location/year:',
				metadata.location,
				metadata.year,
			)
			return { metadata }
		})

// Revision agent
export const revisionAgent = async (state: GeneratorV1GraphState) =>
	await llm.google.image
		// .withStructuredOutput(generatorV1Schema)
		.invoke([
			new SystemMessage(
				state.evaluation?.revisedPrompt ??
					'Revise this image so it looks strictly like a modern digital photograph',
			),
			new HumanMessage({
				content: [
					{
						id: 'generatedImg',
						type: 'image_url',
						image_url: `data:${state.generation.content[0].inlineData.mimeType};base64,${state.generation.content[0].inlineData.data}`, // First gen image
					},
				],
			}),
		])
		.then((result) => {
			if (!state.evaluation?.revisedPrompt)
				console.warn('No revised prompt found')
			// Ensure first item is the image
			const revision = result
			if (Array.isArray(revision.content)) {
				const imageIndex = revision.content.findIndex(
					(part) => part.type === 'inlineData',
				)
				revision.content.unshift(
					revision.content.splice(imageIndex, 1)[0],
				)
			}
			console.log('Revision complete. Replies:', revision.content.length)
			return { revision } // Return the evaluation result in the graph state
		})

// Agent which re-evaluates the revised image against the base image and requirements
export const reEvaluatorAgent = async (state: GeneratorV1GraphState) =>
	await llm.google.chat
		.withStructuredOutput(generatorV1Schema)
		.invoke([
			new SystemMessage(
				'Evaluate the first, revised "generatedImg" against stated criteria in reference to the second "baseImg" image',
			),
			new HumanMessage({
				content: [
					{
						id: 'generatedImg',
						type: 'image_url',
						image_url: `data:${state.revision.content[0].inlineData.mimeType};base64,${state.revision.content[0].inlineData.data}`, // First gen image must be a full data URL
					},
					{
						id: 'baseImg',
						type: 'image_url',
						image_url: state.request.image_url,
					},
				],
			}),
		])
		.then((reEvaluation) => {
			console.log('Re-evaluation complete. Score:', reEvaluation.score)
			return { reEvaluation } // Return the evaluation result in the graph state
		})
