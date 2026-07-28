// Structured critic response schema for deterministic evaluation output.
import { z } from 'zod'

export const evaluatorSchema = z.object({
	doesNotContainUI: z
		.boolean()
		.describe(
			'False if the generated image contains any user interface element (e.g. navigation arrows, buttons, window panels, etc.).',
		),
	isHighResolution: z
		.boolean()
		.describe(
			'True if the generated image is high-resolution and clear, with discernable features (i.e. not blurry or pixelated).',
		),
	isFullColor: z
		.boolean()
		.describe(
			'True if the generated image is in full color and not black-and-white, grayscale, sepia or otherwise reduced in colorspace (e.g., watercolor, oil painting etc.).',
		),
	doesNotContainHistoricalAnachronisms: z
		.boolean()
		.describe(
			'False if the generated image contains any historical anachronisms (e.g., modern buildings, vehicles, clothing, signage, etc.).',
		),
	doesNotContainGeographicalInaccuracies: z
		.boolean()
		.describe(
			'False if the generated image contains any geographical inaccuracies (e.g., buildings, landmarks, or topography that are added and do not match the specified location).',
		),
	isMatchingPerspective: z
		.boolean()
		.describe(
			'True if the generated image has the same perspective as the base image.',
		),
	isMatchingHistoricalPeriod: z
		.boolean()
		.describe(
			'True if the generated image reflects the same historical event/period as the base image.',
		),
	doesNotContainUnwantedArtifacts: z
		.boolean()
		.describe(
			'False if the generated image contains any unwanted visual artifacts (e.g., malformed shapes, inaccurate human bodies, other nonsensical elements).',
		),
	score: z
		.number()
		.describe(
			'Overall score for the generated image, based on the number of evaluation criteria above that it did meet (i.e., are TRUE).',
		),
	subjectiveCritique: z
		.string()
		.describe(
			'Subjective critique of the generated image in terms of its accuracy, quality and relevance.',
		),
})
