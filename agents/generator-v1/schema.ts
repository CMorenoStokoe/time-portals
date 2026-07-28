// Structured critic response schema for deterministic evaluation output.
import { z } from 'zod'

export const generatorV1Schema = z.object({
	// Evaluation
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
			'True if the generated image is in full color, meaning every element is coloured like a modern photograph would be, and does not contain elements of black-and-white, grayscale, or sepia etc.',
		),
	doesNotContainModernPeople: z
		.boolean()
		.describe(
			'False if the generated image contains any modern people (e.g., people wearing modern clothing, hairstyles, or accessories).',
		),
	doesNotContainModernBuildings: z
		.boolean()
		.describe(
			'False if the generated image contains any modern buildings (e.g., buildings that were not present in the historical period of the base image).',
		),
	doesNotContainModernObjects: z
		.boolean()
		.describe(
			'False if the generated image contains any modern objects (e.g., vehicles, signage, or other objects that were not present in the historical period of the base image).',
		),
	doesNotLookAnachronistic: z
		.boolean()
		.describe(
			'False if the generated image looks anachronistic (e.g., contains elements that do not belong in the historical period of the base image).',
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
			'True if all people, buildings and details in the image reflect the same historical event/period as the base image.',
		),
	doesNotContainUnwantedArtifacts: z
		.boolean()
		.describe(
			'False if the generated image contains any unwanted visual artifacts (e.g., malformed shapes, inaccurate human bodies, other nonsensical elements).',
		),
	doesLookLikeADigitalPhotograph: z
		.boolean()
		.describe(
			'False if the image does not look like a digital photograph (e.g., like a painting medium, or has a frame around it)',
		),
	isASingleImage: z
		.boolean()
		.describe(
			'False if the image contains multiple images (e.g., a collage, or multiple frames).',
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
	requiresRevision: z
		.boolean()
		.describe(
			'True if the generated image failed any of the tests above (i.e., any were false).',
		),
	revisedPrompt: z
		.string()
		.describe(
			'If the image requires revision: A subsequent prompt designed to fix any specific issue(s) identified in the image evaluation.',
		),
})

// Metadata schema
export const metadataSchema = z.object({
	year: z
		.number()
		.int()
		.describe(
			'The year the image was taken, or the year the image is depicting. If the year is unknown, give your best estimate.',
		),
	location: z
		.string()
		.describe(
			'Within Gibraltar, where was this image taken? The location MUST be within Gibraltar, and not Spain for example. If the location is unknown, or the image is taken from the sky, give your best guess as to what the location pictured is. Example: Casemates Square. Another example: Main Street',
		),
	coordinates: z.object({
		latitude: z.number().describe('The latitude of the location.'),
		longitude: z.number().describe('The longitude of the location.'),
	}),
	highlights: z
		.array(
			z.object({
				x: z
					.number()
					.describe(
						'The x position of the highlight, between 0 and 1, representing the highlight x-axis location in the image, where higher values are further to the right in the image.',
					),
				y: z
					.number()
					.describe(
						'The y position of the highlight, between 0 and 1, representing the highlight y-axis location in the image, where higher values are lower in the image.',
					),
				text: z
					.string()
					.describe(
						'A very short description of the highlight. No more than one sentence.',
					),
			}),
		)
		.describe(
			'An array of upto 3 highlights in the image, each with an x and y coordinate (between 0 and 1) and a short description of what is being highlighted.',
		),
})
