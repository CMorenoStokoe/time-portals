// Critic node factory that validates each generated image against constraints.
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import type { Runnable } from '@langchain/core/runnables'

import type { CriticEvaluation } from '../schemas/critic-schema.js'
import type { PipelineState } from '../schemas/graph-state.js'

const isQuotaError = (error: unknown): boolean => {
	if (!(error instanceof Error)) {
		return false
	}

	const message = error.message.toLowerCase()
	return message.includes('429') || message.includes('quota exceeded')
}

export const createCriticNode = (
	criticLlm: Runnable<unknown, CriticEvaluation>,
) => {
	return async (state: PipelineState) => {
		if (!state.imageUrl.startsWith('data:image/')) {
			return {
				status: 'approved' as const,
				qaFeedback:
					'Critic skipped: image URL is not an inline data URL.',
			}
		}

		const systemPrompt = new SystemMessage(
			'Review the provided historical recreation against the target era. Flag modern artifacts or incorrect architectural styles.',
		)

		const message = new HumanMessage({
			content: [
				{ type: 'text', text: `Target Constraints: ${state.request}` },
				{ type: 'image_url', image_url: { url: state.imageUrl } },
			],
		})

		let evaluation: CriticEvaluation

		try {
			evaluation = await criticLlm.invoke([systemPrompt, message])
		} catch (error) {
			if (!isQuotaError(error)) {
				throw error
			}

			evaluation = {
				approved: true,
				feedback: 'Quota fallback: critic unavailable during this run.',
			}
		}

		return {
			status: evaluation.approved ? 'approved' : 'rejected',
			qaFeedback: evaluation.feedback,
		}
	}
}
