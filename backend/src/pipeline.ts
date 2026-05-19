// Builds and wires the LangGraph generator-critic pipeline.
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { START, StateGraph } from '@langchain/langgraph'
import { createCriticNode } from './nodes/critic-node.js'
import { evaluateQuality } from './nodes/evaluate-quality.js'
import { createGeneratorNode } from './nodes/generator-node.js'
import { CriticSchema } from './schemas/critic-schema.js'
import { GraphState } from './schemas/graph-state.js'

// Initialise llms
const llm = new ChatGoogleGenerativeAI({
	apiKey: process.env.GOOGLE_API_KEY as string,
	model: 'gemini-2.0-flash-lite',
})
const criticLlm = llm.withStructuredOutput(CriticSchema, {
	name: 'historical_qa',
})

// Initialise nodes
const generatorNode = createGeneratorNode(llm)
const criticNode = createCriticNode(criticLlm)

// Define graph
export const historicalImageAgent = new StateGraph(GraphState)
	.addNode('generator', generatorNode)
	.addNode('critic', criticNode)
	.addEdge(START, 'generator')
	.addEdge('generator', 'critic')
	.addConditionalEdges('critic', evaluateQuality)
	.compile()
