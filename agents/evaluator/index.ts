// Entrypoint that runs the historical image graph.
import { evaluatorGraph } from './graph.js'
import { EvaluatorRequest } from './types.js'

// Wrapper function to invoke the evaluator graph with the provided request
export const evaluator = async (request: EvaluatorRequest) =>
	await evaluatorGraph.compile().invoke({ request })
