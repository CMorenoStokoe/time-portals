// Shared graph state schema used by all nodes in the pipeline.
import { Annotation } from '@langchain/langgraph'

export const GraphState = Annotation.Root({
	request: Annotation<string>({ reducer: (x, y) => y ?? x }),
	imagePrompt: Annotation<string>({ reducer: (x, y) => y ?? x }),
	imageUrl: Annotation<string>({ reducer: (x, y) => y ?? x }),
	qaFeedback: Annotation<string>({ reducer: (x, y) => y ?? x }),
	revisionCount: Annotation<number>({
		reducer: (x, y) => x + y,
		default: () => 0,
	}),
	status: Annotation<'pending' | 'approved' | 'rejected'>({
		reducer: (x, y) => y ?? x,
		default: () => 'pending',
	}),
})

export type PipelineState = typeof GraphState.State
