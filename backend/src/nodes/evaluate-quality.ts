// Routing rule that stops on approval or max revision count.
import { END } from '@langchain/langgraph'

import type { PipelineState } from '../schemas/graph-state.js'

export const evaluateQuality = (state: PipelineState) => {
	if (state.status === 'approved' || state.revisionCount >= 3) {
		return END
	}

	return 'generator'
}
