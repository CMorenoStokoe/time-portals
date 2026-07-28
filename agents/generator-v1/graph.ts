// Shared graph state schema used by all nodes in the pipeline.
import { Annotation, END, START, StateGraph } from '@langchain/langgraph'
import { GeneratorV1Request } from './types'
import { generatorV1Schema, metadataSchema } from './schema'
import {
	evaluatorAgent,
	generatorV1Agent,
	metadataAgent,
	reEvaluatorAgent,
	revisionAgent,
} from './agent'

// Define the graph state schema
export const GraphState = Annotation.Root({
	request: Annotation<GeneratorV1Request>(), // Immutable initial input
	generation: Annotation<{
		content: [
			{
				type: 'inlineData'
				inlineData: {
					mimeType: 'image/png'
					data: string
				}
			},
		]
	}>(), // Generation of the historical image to a modern photorealistic image
	evaluation: Annotation<typeof generatorV1Schema>(), // Evaluation of the generated image against the base image and requirements
	metadata: Annotation<typeof metadataSchema>(), // Metadata including year, location and coordinates
	revision: Annotation<{
		content: [
			{
				type: 'inlineData'
				inlineData: {
					mimeType: 'image/png'
					data: string
				}
			},
		]
	}>(), // A revised version of the image
	reEvaluation: Annotation<typeof generatorV1Schema>(), // Re-evaluation of the revised image against the base image and requirements
})

// Agent logic flow
export const generatorV1Graph = new StateGraph(GraphState)
	// Nodes
	.addNode('generator', generatorV1Agent)
	.addNode('evaluator', evaluatorAgent)
	.addNode('metadatabot', metadataAgent)
	.addNode('reviser', revisionAgent)
	.addNode('reEvaluator', reEvaluatorAgent)
	.addEdge(START, 'generator')
	.addEdge('generator', 'evaluator')
	.addEdge('evaluator', 'metadatabot')
	.addConditionalEdges(
		// Revise when required; otherwise finish
		'metadatabot',
		(state) => state?.evaluation?.requiresRevision,
		{
			true: 'reviser',
			false: END,
		},
	)
	.addEdge('reviser', 'reEvaluator')
	.addEdge('reEvaluator', END)
