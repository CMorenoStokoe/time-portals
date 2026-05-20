// Generator node factory that creates prompts and calls image generation.
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import type { Runnable } from '@langchain/core/runnables'

import type { PipelineState } from '../schemas/graph-state.js'
import { generateImageTool } from '../tools/image-tool.js'

const isQuotaError = (error: unknown): boolean => {
	if (!(error instanceof Error)) {
		return false
	}

	const message = error.message.toLowerCase()
	return message.includes('429') || message.includes('quota exceeded')
}

type PromptGenerator = Runnable<unknown, { content: unknown }>

export const createGeneratorNode = (llm?: PromptGenerator) => {
	return async (state: PipelineState) => {
		const systemPrompt = new SystemMessage(
			'Construct a highly detailed image generation prompt focusing on period-accurate materials, lighting, and topography.' +
				(state.qaFeedback
					? `\n\nCRITICAL FIXES REQUIRED: ${state.qaFeedback}`
					: ''),
		)

		const createFallbackPrompt = () =>
			[
				'Historically accurate reconstruction prompt.',
				`Scene request: ${state.request}`,
				state.qaFeedback
					? `Apply critic fixes: ${state.qaFeedback}`
					: 'No critic fixes available.',
			].join(' ')

		let newPrompt = createFallbackPrompt()

		if (llm) {
			try {
				const response = await llm.invoke([
					systemPrompt,
					new HumanMessage(state.request),
				])

				newPrompt = String(response.content)
			} catch (error) {
				if (!isQuotaError(error)) {
					throw error
				}
			}
		}

		const imageUrl = await generateImageTool(newPrompt, {
			revisionCount: state.revisionCount,
			qaFeedback: state.qaFeedback,
		})

		return {
			imagePrompt: newPrompt,
			imageUrl,
			revisionCount: 1,
		}
	}
}
