import { generatorV1Graph } from './graph'
import { GeneratorV1Request } from './types'

// Wrapper function to invoke the evaluator graph with the provided request
export const generatorV1 = async (request: GeneratorV1Request) =>
	await generatorV1Graph.compile().invoke({ request })
