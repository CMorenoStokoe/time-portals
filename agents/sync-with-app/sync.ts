import fs from 'node:fs'
import path from 'node:path'
import { version } from '../generator-v1/version.json'
import { getInputDir, getOutDir } from '../cfg/dir'

// App data types
interface Metadata {
	country: string
	location: string
	latitude: number
	longitude: number
	heading: number
	pitch: number
	year: number
	filename: string
	referenceFilename?: string // Base image reference
	highlights: {
		x: number
		y: number
		text: string
	}[]
	ai: true
}

const SCORE_THRESHOLD = 13 // Minimum score for an image to be considered acceptable

// Entrypoint to push the latest and greatest data to the web app data folder
const sync = async () => {
	// Get image outputs
	const stagedInputs = fs.readdirSync(getInputDir('STAGED', version))
	const generatorV1Inputs = fs.readdirSync(
		getInputDir('generatorV1', version),
	)
	const stagedImageFiles = stagedInputs.filter(
		(file) => !file.endsWith('.json'),
	)
	fs.mkdirSync(getOutDir('STAGED', version), { recursive: true })
	console.log(`Got ${stagedInputs.length} staged image files`)
	console.log(`Got ${generatorV1Inputs.length} base reference image files`)
	// Put metadata into app data formats
	const metadata: Metadata[] = []
	for (const image_file of stagedInputs) {
		if (image_file.endsWith('.json')) {
			console.log('Reading metadata file', image_file)
			const metadataFile = path.join(
				getInputDir('STAGED', version),
				image_file,
			)
			const metadataContent = fs.readFileSync(metadataFile, 'utf-8')
			const parsedMetadata = JSON.parse(metadataContent) as {
				evaluation?: { score?: number }
				reEvaluation?: { score?: number }
				metadata: {
					year: number
					location: string
					coordinates: {
						latitude: number
						longitude: number
					}
					highlights?: {
						x: number
						y: number
						text: string
					}[]
				}
			}
			const sceneMetadata = parsedMetadata.metadata
			const normalisedName = image_file.replace(/\.json$/, '')
			const referenceImageFile = generatorV1Inputs.find((inputFile) =>
				inputFile.startsWith(normalisedName),
			)
			const generatedImageFile =
				stagedImageFiles.find((file) =>
					file.startsWith(`${normalisedName}-revised.`),
				) ??
				stagedImageFiles.find((file) =>
					file.startsWith(`${normalisedName}.`),
				)
			if (!generatedImageFile) {
				console.log(
					'FAIL: No generated image found for metadata file, skipping',
					image_file,
				)
				continue
			}
			const isRevision = generatedImageFile.startsWith(
				`${normalisedName}-revised.`,
			)

			const appMetadata: Metadata = {
				country: 'Gibraltar',
				location: sceneMetadata.location,
				latitude: sceneMetadata.coordinates.latitude,
				longitude: sceneMetadata.coordinates.longitude,
				heading: 0,
				pitch: 0,
				year: sceneMetadata.year,
				filename: generatedImageFile, // Output image filename with original extension
				highlights: sceneMetadata.highlights ?? [],
				referenceFilename: referenceImageFile,
				ai: true, // Indicates the image was ai generated
			}

			// Check if image is good enough quality to add to the app
			const highestScore = isRevision
				? parsedMetadata.reEvaluation?.score
				: parsedMetadata.evaluation?.score
			if ((highestScore ?? -Infinity) >= SCORE_THRESHOLD) {
				console.log(
					'PASS: Image meets quality threshold, adding to app metadata',
					highestScore,
				)
				// Copy the image file to the app data folder
				metadata.push(appMetadata)

				// Try to copy reference image too
				if (referenceImageFile) {
					console.log(
						'Copying reference image file',
						referenceImageFile,
					)
					fs.copyFileSync(
						path.join(
							getInputDir('generatorV1', version),
							referenceImageFile,
						),
						path.join(
							getOutDir('STAGED', version),
							referenceImageFile,
						),
					)
				}
			} else {
				console.log(
					'FAIL: Image does not meet quality threshold, skipping',
					highestScore,
				)
			}
		} else {
			// Copy images (even if we only use the ones which we have metadata for)
			console.log('Copying image file', image_file)
			fs.copyFileSync(
				path.join(getInputDir('STAGED', version), image_file),
				path.join(getOutDir('STAGED', version), image_file),
			)
		}
	}
	fs.writeFileSync(
		path.join(getOutDir('STAGED', version), 'metadata.json'),
		JSON.stringify({ metadata }, null, 2),
		// Replace file if exists
	)
}
sync()
	.then(() => {
		console.log(`Sync completed successfully.`)
		process.exit(0)
	})
	.catch((err) => {
		console.error('Error performing sync:', err)
		process.exit(1)
	})
