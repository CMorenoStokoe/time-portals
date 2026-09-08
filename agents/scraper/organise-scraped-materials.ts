// Organises scraped materials from the latest scrape into a more structured format for easier processing and analysis
// structureLatestScraperOutput.ts
//
// Takes the latest scraper run and produces:
//
// structured/
// ├── images/
// │   ├── 0001-example-abc123.jpg
// │   └── ...
// └── json/
//     ├── 0001-example-abc123.json
//     └── ...

import fs from 'node:fs'
import path from 'node:path'

type PageCoordinate = {
	source: string
	latitude: number
	longitude: number
}

type PageImageRecord = {
	url: string
	alt?: string
	title?: string
	caption?: string
	description?: string
	contextText?: string
	year?: number
	yearCandidates: number[]
	coordinates: PageCoordinate[]
	latitude?: number
	longitude?: number
	downloadedRelativePath?: string
}

type CrawledPage = {
	url: string
	pageFileName: string
	pageSlug: string
	categories: {
		label: string
		url: string
		slug: string
	}[]
	location?: string | null
	coordinates: PageCoordinate[]
	latitude?: number
	longitude?: number
	heritageItem?: Record<string, unknown>
	images: PageImageRecord[]
}

type DownloadedImage = {
	url: string
	fileName: string
	relativePath: string
	sha256: string
	bytes: number
	contentType: string
	firstSeenOn: string
}

type CrawlManifest = {
	startedAt: string
	finishedAt: string
	pages: CrawledPage[]
	downloadedImages: DownloadedImage[]
}

const DEFAULT_SCRAPER_OUTPUT_ROOT = path.join(
	process.cwd(),
	'..',
	'database',
	'agents',
	'scraper',
	'outputs',
)

const DEFAULT_OUTPUT_ROOT = path.join(
	process.cwd(),
	'..',
	'database',
	'agents',
	'scraper',
	'outputs',
	'LATEST',
)

const getArgument = (name: string) => {
	const prefix = `--${name}=`
	const argument = process.argv
		.slice(2)
		.find((value) => value.startsWith(prefix))
	return argument?.slice(prefix.length)
}

const ensureEmptyDirectory = (directory: string) => {
	fs.rmSync(directory, { recursive: true, force: true })
	fs.mkdirSync(directory, { recursive: true })
}

const readManifest = (runDirectory: string): CrawlManifest | undefined => {
	const manifestPath = path.join(runDirectory, 'manifest.json')
	if (!fs.existsSync(manifestPath)) return undefined

	try {
		return JSON.parse(
			fs.readFileSync(manifestPath, 'utf8'),
		) as CrawlManifest
	} catch {
		return undefined
	}
}

const getLatestScraperRun = (outputsRoot: string) => {
	if (!fs.existsSync(outputsRoot)) {
		throw new Error(
			`Scraper output directory does not exist: ${outputsRoot}`,
		)
	}

	const runs = fs
		.readdirSync(outputsRoot, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => {
			const directory = path.join(outputsRoot, entry.name)
			const manifest = readManifest(directory)

			if (!manifest) return undefined

			const finishedAt = Date.parse(manifest.finishedAt)

			return {
				directory,
				manifest,
				finishedAt: Number.isFinite(finishedAt)
					? finishedAt
					: fs.statSync(directory).mtimeMs,
			}
		})
		.filter(
			(
				run,
			): run is {
				directory: string
				manifest: CrawlManifest
				finishedAt: number
			} => Boolean(run),
		)
		.sort((a, b) => b.finishedAt - a.finishedAt)

	const latestRun = runs[0]

	if (!latestRun) {
		throw new Error(
			`No scraper runs containing manifest.json found in ${outputsRoot}`,
		)
	}

	return latestRun
}

const getJsonFileName = (imageFileName: string) => {
	const extension = path.extname(imageFileName)
	const basename = path.basename(imageFileName, extension)
	return `${basename}.json`
}

const run = () => {
	const scraperOutputsRoot = path.resolve(
		getArgument('input') ?? DEFAULT_SCRAPER_OUTPUT_ROOT,
	)

	const outputRoot = path.resolve(
		getArgument('output') ?? DEFAULT_OUTPUT_ROOT,
	)

	const latestRun = getLatestScraperRun(scraperOutputsRoot)
	const sourceImagesRoot = path.join(latestRun.directory, 'images')

	const outputImagesRoot = path.join(outputRoot, 'images')
	const outputJsonRoot = path.join(outputRoot, 'json')

	ensureEmptyDirectory(outputImagesRoot)
	ensureEmptyDirectory(outputJsonRoot)

	// An image can appear on more than one page, so retain every page occurrence.
	const pageImagesByUrl = new Map<
		string,
		Array<{
			page: Omit<CrawledPage, 'images'>
			image: PageImageRecord
		}>
	>()

	for (const page of latestRun.manifest.pages) {
		const { images: _images, ...pageMetadata } = page

		for (const image of page.images) {
			const existing = pageImagesByUrl.get(image.url) ?? []

			existing.push({
				page: pageMetadata,
				image,
			})

			pageImagesByUrl.set(image.url, existing)
		}
	}

	let written = 0

	for (const downloadedImage of latestRun.manifest.downloadedImages) {
		const sourceImagePath = path.join(
			sourceImagesRoot,
			downloadedImage.relativePath,
		)

		if (!fs.existsSync(sourceImagePath)) {
			console.warn(`Missing image: ${sourceImagePath}`)
			continue
		}

		const outputImagePath = path.join(
			outputImagesRoot,
			downloadedImage.fileName,
		)

		const matchingRecords = pageImagesByUrl.get(downloadedImage.url) ?? []
		const primaryRecord = matchingRecords[0]

		const metadata = {
			fileName: downloadedImage.fileName,
			imagePath: `../images/${downloadedImage.fileName}`,

			source: {
				url: downloadedImage.url,
				firstSeenOn: downloadedImage.firstSeenOn,
			},

			file: {
				sha256: downloadedImage.sha256,
				bytes: downloadedImage.bytes,
				contentType: downloadedImage.contentType,
			},

			// Convenient top-level metadata from the first matching page record.
			alt: primaryRecord?.image.alt,
			title: primaryRecord?.image.title,
			caption: primaryRecord?.image.caption,
			description: primaryRecord?.image.description,
			contextText: primaryRecord?.image.contextText,
			year: primaryRecord?.image.year,
			yearCandidates: primaryRecord?.image.yearCandidates ?? [],
			coordinates: primaryRecord?.image.coordinates ?? [],
			latitude: primaryRecord?.image.latitude,
			longitude: primaryRecord?.image.longitude,
			location: primaryRecord?.page.location,
			categories: primaryRecord?.page.categories ?? [],

			// Retains every page on which the image appeared.
			occurrences: matchingRecords,
		}

		fs.copyFileSync(sourceImagePath, outputImagePath)

		fs.writeFileSync(
			path.join(
				outputJsonRoot,
				getJsonFileName(downloadedImage.fileName),
			),
			JSON.stringify(metadata, null, 2),
		)

		written++
	}

	console.log(`Source run: ${latestRun.directory}`)
	console.log(`Structured ${written} image/JSON pairs`)
	console.log(`Images: ${outputImagesRoot}`)
	console.log(`JSON: ${outputJsonRoot}`)
}

run()
