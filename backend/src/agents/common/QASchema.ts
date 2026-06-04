import z from 'zod'

// Define structured QA output
export const QASchema = z.object({
	feedback: z
		.string()
		.describe(
			'Your feedback on how/if the current object passes QA parameters',
		),
	score: z
		.number()
		.describe(
			'Your score between 0-100 for response quality, where 0 is totally unsuitable, and 100 is perfectly suitable',
		),
	pass: z
		.boolean()
		.describe(
			'Boolean true/false whether the current object passes the QA parameters',
		),
	runs: z
		.number()
		.default(0)
		.describe(
			'Number of times the object has been processed by this QA node. Increment this number on each call. Starts at 0, first run should update to 1, etc.',
		),
})
