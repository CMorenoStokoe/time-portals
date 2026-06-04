// Shared graph state schema used by all nodes in the pipeline.
import { Annotation, END, START, StateGraph } from '@langchain/langgraph'
import {
	QA,
	Request,
	Research,
	ResearchHighlightWithLocation,
} from './types.js'
import { describer } from './agents/describer.js'
import { researcher } from './agents/researcher.js'
import { researcherQA } from './agents/researcherQA.js'
import { generator } from './agents/generator.js'
import { generatorQA } from './agents/generatorQA.js'
import { selector } from './agents/selector.js'
import { editor } from './agents/editor.js'

// Define the graph state schema
export const GraphState = Annotation.Root({
	request: Annotation<Request>({ reducer: (x, y) => x }), // Immutable initial input
	// 1 - Hint model with perspective
	baseImageDescription: Annotation<string>(), // Text description of base image perspective/content
	// 2 - Research location (event, year, highlights)
	research: Annotation<Research>(),
	research_QA: Annotation<QA>(), // QA (ensure single year, highlights etc.)
	// 3 - Image generation (base image, with feature 1, with feature 2 etc...)
	imageGen1: Annotation<string>(),
	imageGen1_QA: Annotation<QA>(),
	imageGen2: Annotation<string>(),
	imageGen2_QA: Annotation<QA>(),
	imageGen3: Annotation<string>(),
	imageGen3_QA: Annotation<QA>(),
	imageGen4: Annotation<string>(),
	imageGen4_QA: Annotation<QA>(),
	// Step 3 selection
	selection: Annotation<number>(), // Select best quality image to use
	// Step 4 mark-up the image with popover highlights
	markup: Annotation<ResearchHighlightWithLocation[]>(),
	markup_QA: Annotation<boolean>(), // QA (preview placement of highlights are correct)
})

// Agent logic flow
export const graph = new StateGraph(GraphState)
	// Nodes
	.addNode('describer', describer)
	.addNode('researcher', researcher)
	.addNode('researcherQA', researcherQA)
	.addNode('generator', generator)
	.addNode('generatorQA', generatorQA)
	.addNode('selector', selector)
	.addNode('editor', editor)
	// Edges
	.addEdge(START, 'describer')
	.addEdge('describer', 'researcher') // Research location
	.addEdge('researcher', 'researcherQA')
	.addEdge('researcherQA', 'generator') // Generate image
	.addEdge('generator', 'generatorQA')
	.addEdge('generatorQA', 'editor') // Edit successive generations
	.addEdge('editor', 'editor')
	.addEdge('editor', 'editor')
	.addEdge('editor', 'selector') // Select best image
