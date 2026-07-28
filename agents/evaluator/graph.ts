// Shared graph state schema used by all nodes in the pipeline.
import { Annotation, END, START, StateGraph } from '@langchain/langgraph'
import { evaluatorAgent } from './agent'
import { EvaluatorRequest } from './types'
import { evaluatorSchema } from './schema'

// Define the graph state schema
export const GraphState = Annotation.Root({
	request: Annotation<EvaluatorRequest>(), // Immutable initial input
	evaluator: Annotation<typeof evaluatorSchema>(), // Evaluation of the generated image against the base image and requirements
})

// Agent logic flow
export const evaluatorGraph = new StateGraph(GraphState)
	// Nodes
	.addNode('evaluate', evaluatorAgent)
	// Edges
	.addEdge(START, 'evaluate')
	.addEdge('evaluate', END)
