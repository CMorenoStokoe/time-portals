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

// Entrypoint to push the latest and greatest data to the web app data folder
const sync = async () => {
	// Get image outputs
	const stagedInputs = fs.readdirSync(getInputDir('STAGED', version))
	const generatorV1Inputs = fs.readdirSync(
		getInputDir('generatorV1', version),
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
				metadata: {
					year: number
					location: string
					coordinates: {
						latitude: number
						longitude: number
					}
				}
			}
			const sceneMetadata = parsedMetadata.metadata
			const normalisedName = image_file.split('.')[0] // Removed json but also original extension from name
			const referenceImageFile = generatorV1Inputs.find((inputFile) =>
				inputFile.startsWith(normalisedName),
			)
			// Check if image is revision based on whether the image file can be found with this name, and if not add -revised to the end
			const isRevision =
				!fs.existsSync(
					path.join(getInputDir('STAGED', version), image_file),
				) &&
				fs.existsSync(
					path.join(
						getInputDir('STAGED', version),
						`${normalisedName}-revised.png`,
					),
				)

			const appMetadata: Metadata = {
				country: 'Gibraltar',
				location: sceneMetadata.location,
				latitude: sceneMetadata.coordinates.latitude,
				longitude: sceneMetadata.coordinates.longitude,
				heading: 0,
				pitch: 0,
				year: sceneMetadata.year,
				filename: isRevision
					? image_file.replace('.json', '-revised.png')
					: image_file.replace('.json', '.png'), // Output image filename
				highlights: sceneMetadata.highlights ?? [],
				referenceFilename: referenceImageFile,
				ai: true, // Indicates the image was ai generated
			}
			metadata.push(appMetadata)

			// Try to copy reference image too
			if (referenceImageFile) {
				console.log('Copying reference image file', referenceImageFile)
				fs.copyFileSync(
					path.join(
						getInputDir('generatorV1', version),
						referenceImageFile,
					),
					path.join(getOutDir('STAGED', version), referenceImageFile),
				)
			}
		} else {
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
