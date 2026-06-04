// Structured critic response schema for deterministic evaluation output.
import { z } from 'zod'

export const CriticSchema = z.object({
	approved: z
		.boolean()
		.describe('True if the image contains zero historical anachronisms.'),
	feedback: z
		.string()
		.describe(
			'Specific architectural or topographical corrections required.',
		),
})

export type CriticEvaluation = z.infer<typeof CriticSchema>
