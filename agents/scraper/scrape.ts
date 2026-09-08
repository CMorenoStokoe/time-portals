// Scrapes the gibraltar heritage site to download images for sites across Gibraltar
// Url: https://www.ministryforheritage.gi/heritage-and-antiquities/
// Url example branch: https://www.ministryforheritage.gi/heritage-and-antiquities/category/2-monuments-6
// Save results to database\agents\scraper\outputs
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const DEFAULT_START_URL =
	'https://www.ministryforheritage.gi/heritage-and-antiquities/'
const DEFAULT_DISCOVERY_URL =
	'https://www.ministryforheritage.gi/heritage-and-antiquities-act-listings'
const DEFAULT_SEED_URLS = [
	'https://www.ministryforheritage.gi/heritage-and-antiquities/category/1-buildings-2',
	'https://www.ministryforheritage.gi/heritage-and-antiquities/category/2-monuments-6',
	'https://www.ministryforheritage.gi/heritage-and-antiquities/category/3-fortifications-5',
]
const DEFAULT_MAX_PAGES = 200
const DEFAULT_OUTPUT_ROOT = path.join(
	process.cwd(),
	'..',
	'database',
	'agents',
	'scraper',
	'outputs',
)
const IMAGE_EXTENSIONS = new Set([
	'.jpg',
	'.jpeg',
	'.png',
	'.gif',
	'.webp',
	'.svg',
	'.bmp',
	'.tif',
	'.tiff',
	'.avif',
])
const BLACKLISTED_IMAGE_PATH_PREFIXES = [
	'/assets/favicon/',
	'/assets/img/icons/',
	'/uploads/heritage act listing category images/',
]
const BLACKLISTED_IMAGE_PATHS = new Set([
	'/assets/img/logo.png',
	'/assets/img/hm-government-of-gibraltar-logo-white.png',
])

type CliOptions = {
	startUrl: string
	maxPages: number
	outputRoot: string
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

type HeritagePageData = {
	id?: number
	name?: string
	url?: string
	location?: string | null
	item_lat?: string | null
	item_long?: string | null
	image_by_ref?: string | null
	main_image?: string | null
	reference?: string | null
	short_description?: string | null
	description?: string | null
	[key: string]: unknown
}

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

type PageCategory = {
	label: string
	url: string
	slug: string
}

type CrawledPage = {
	url: string
	pageFileName: string
	pageSlug: string
	categories: PageCategory[]
	location?: string | null
	coordinates: PageCoordinate[]
	latitude?: number
	longitude?: number
	heritageItem?: HeritagePageData
	images: PageImageRecord[]
}

type CrawlManifest = {
	startUrl: string
	hostname: string
	pathScope: string
	seedPages: string[]
	startedAt: string
	finishedAt: string
	maxPages: number
	crawledPages: string[]
	skippedPages: string[]
	pages: CrawledPage[]
	downloadedImages: DownloadedImage[]
}

const parseCliOptions = (argv: string[]): CliOptions => {
	let startUrl = DEFAULT_START_URL
	let maxPages = DEFAULT_MAX_PAGES
	let outputRoot = DEFAULT_OUTPUT_ROOT

	for (const arg of argv) {
		if (arg.startsWith('--max-pages=')) {
			const value = Number.parseInt(arg.split('=')[1] || '', 10)
			if (Number.isFinite(value) && value > 0) maxPages = value
			continue
		}

		if (arg.startsWith('--output=')) {
			const value = arg.split('=').slice(1).join('=').trim()
			if (value) outputRoot = path.resolve(process.cwd(), value)
			continue
		}

		if (!arg.startsWith('--')) startUrl = arg
	}

	return { startUrl, maxPages, outputRoot }
}

const normalizeUrl = (candidate: string, baseUrl: URL): URL | undefined => {
	try {
		const resolved = new URL(candidate, baseUrl)
		resolved.hash = ''
		return resolved
	} catch {
		return undefined
	}
}

const isSameHostname = (candidate: URL, root: URL) =>
	candidate.hostname === root.hostname

const normalizePathScope = (pathname: string) => {
	if (!pathname || pathname === '/') return '/'
	return pathname.endsWith('/') ? pathname : `${pathname}/`
}

const isInPathScope = (candidate: URL, root: URL) => {
	const rootScope = normalizePathScope(root.pathname)
	if (rootScope === '/') return true

	const candidatePath = candidate.pathname
	return (
		candidatePath === root.pathname || candidatePath.startsWith(rootScope)
	)
}

const looksLikeImageUrl = (candidate: URL) => {
	const pathname = candidate.pathname.toLowerCase()
	return Array.from(IMAGE_EXTENSIONS).some((ext) => pathname.endsWith(ext))
}

const getComparablePathname = (candidate: URL) => {
	try {
		return decodeURIComponent(candidate.pathname).toLowerCase()
	} catch {
		return candidate.pathname.toLowerCase()
	}
}

const isBlacklistedImageUrl = (candidate: URL) => {
	const pathname = getComparablePathname(candidate)
	if (BLACKLISTED_IMAGE_PATHS.has(pathname)) return true

	return BLACKLISTED_IMAGE_PATH_PREFIXES.some((prefix) =>
		pathname.startsWith(prefix),
	)
}

const shouldQueuePage = (candidate: URL, root: URL) => {
	if (!isSameHostname(candidate, root)) return false
	if (!['http:', 'https:'].includes(candidate.protocol)) return false
	if (!isInPathScope(candidate, root)) return false
	return !looksLikeImageUrl(candidate)
}

const extractAttributeValues = (html: string, attribute: string) => {
	const values: string[] = []
	const pattern = new RegExp(`${attribute}\\s*=\\s*["']([^"']+)["']`, 'gi')
	for (const match of html.matchAll(pattern)) {
		const value = decodeHtml(match[1] || '').trim()
		if (value) values.push(value)
	}
	return values
}

const extractMetaImageValues = (html: string) => {
	const values: string[] = []
	const metaPattern =
		/<meta[^>]+(?:property|name)=["'][^"']*(?:image|og:image|twitter:image)[^"']*["'][^>]+content=["']([^"']+)["'][^>]*>/gi
	for (const match of html.matchAll(metaPattern)) {
		const value = decodeHtml(match[1] || '').trim()
		if (value) values.push(value)
	}
	return values
}

const extractImageTagValues = (html: string) => {
	const values: string[] = []
	const tagPattern = /<(img|source)\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi
	for (const match of html.matchAll(tagPattern)) {
		const value = decodeHtml(match[2] || '').trim()
		if (value) values.push(value)
	}
	return values
}

const extractIconValues = (html: string) => {
	const values: string[] = []
	const linkPattern =
		/<link\b[^>]*\brel=["'][^"']*(?:icon|apple-touch-icon)[^"']*["'][^>]*\bhref=["']([^"']+)["'][^>]*>/gi
	for (const match of html.matchAll(linkPattern)) {
		const value = decodeHtml(match[1] || '').trim()
		if (value) values.push(value)
	}
	return values
}

const extractSrcsetValues = (html: string) => {
	const values: string[] = []
	for (const srcset of extractAttributeValues(html, 'srcset')) {
		for (const entry of srcset.split(',')) {
			const url = entry.trim().split(/\s+/)[0]
			if (url) values.push(url)
		}
	}
	return values
}

const sanitizeSegment = (value: string) =>
	value
		.replace(/[^a-z0-9]+/gi, '-')
		.replace(/^-+|-+$/g, '')
		.toLowerCase()

const extensionFromContentType = (contentType: string) => {
	const normalized = contentType.toLowerCase().split(';')[0].trim()
	if (normalized === 'image/jpeg') return '.jpg'
	if (normalized === 'image/png') return '.png'
	if (normalized === 'image/gif') return '.gif'
	if (normalized === 'image/webp') return '.webp'
	if (normalized === 'image/svg+xml') return '.svg'
	if (normalized === 'image/bmp') return '.bmp'
	if (normalized === 'image/tiff') return '.tiff'
	if (normalized === 'image/avif') return '.avif'
	return undefined
}

const extensionFromUrl = (imageUrl: URL) => {
	const ext = path.extname(imageUrl.pathname).toLowerCase()
	return IMAGE_EXTENSIONS.has(ext) ? ext : undefined
}

const fileNameForImage = (
	imageUrl: URL,
	contentType: string,
	sha256: string,
	index: number,
) => {
	const slug =
		sanitizeSegment(
			imageUrl.pathname.split('/').filter(Boolean).pop() || '',
		) || 'image'
	const extension =
		extensionFromContentType(contentType) ||
		extensionFromUrl(imageUrl) ||
		'.bin'
	return `${String(index).padStart(4, '0')}-${slug}-${sha256.slice(0, 12)}${extension}`
}

const outputDirForPage = (pageUrl: URL) => {
	const segments = pageUrl.pathname
		.split('/')
		.filter(Boolean)
		.map((segment) => sanitizeSegment(segment))
		.filter(Boolean)

	if (segments.length === 0) return 'root'
	return path.join(...segments)
}

const pageSlugForUrl = (pageUrl: URL) => {
	const segment = pageUrl.pathname.split('/').filter(Boolean).pop()
	return sanitizeSegment(segment || 'page') || 'page'
}

const pageFileNameForUrl = (pageUrl: URL, categories: PageCategory[]) => {
	const categoryPrefix = categories[0]?.slug
	const pageSlug = pageSlugForUrl(pageUrl)
	return categoryPrefix
		? `${categoryPrefix}--${pageSlug}.json`
		: `${pageSlug}.json`
}

const ensureDir = (dirPath: string) => {
	fs.mkdirSync(dirPath, { recursive: true })
}

const parseNumber = (value: string | null | undefined) => {
	if (value == null || value === '') return undefined
	const parsed = Number(value)
	return Number.isFinite(parsed) ? parsed : undefined
}

const decodeHtml = (value: string) =>
	value
		.replace(/&nbsp;/gi, ' ')
		.replace(/&amp;/gi, '&')
		.replace(/&quot;/gi, '"')
		.replace(/&#0*39;|&apos;/gi, "'")
		.replace(/&rsquo;/gi, "'")
		.replace(/&ldquo;|&rdquo;/gi, '"')
		.replace(/&lt;/gi, '<')
		.replace(/&gt;/gi, '>')

const stripHtml = (value: string) =>
	decodeHtml(value.replace(/<[^>]+>/g, ' '))
		.replace(/\s+/g, ' ')
		.trim()

const extractYears = (value: string) => {
	const matches = value.match(/\b(1[5-9]\d{2}|20\d{2})\b/g) ?? []
	return [...new Set(matches.map((match) => Number(match)))]
}

const extractTagAttribute = (tagHtml: string, attribute: string) => {
	const match = tagHtml.match(
		new RegExp(`${attribute}\\s*=\\s*["']([^"']+)["']`, 'i'),
	)
	return match?.[1] ? decodeHtml(match[1]).trim() : undefined
}

const extractPageCategories = (html: string, pageUrl: URL) => {
	const categories: PageCategory[] = []
	const seenUrls = new Set<string>()
	const linkPattern =
		/<a[^>]+href=["']([^"']*\/heritage-and-antiquities\/category\/[^"']+)["'][^>]*>(.*?)<\/a>/gis

	for (const match of html.matchAll(linkPattern)) {
		const href = match[1]?.trim()
		const label = stripHtml(match[2] || '')
		if (!href || !label) continue

		const categoryUrl = normalizeUrl(href, pageUrl)
		if (!categoryUrl || seenUrls.has(categoryUrl.href)) continue
		seenUrls.add(categoryUrl.href)

		const slug =
			sanitizeSegment(
				categoryUrl.pathname.split('/').filter(Boolean).pop() || label,
			) || 'category'

		categories.push({
			label,
			url: categoryUrl.href,
			slug,
		})
	}

	return categories
}

const extractImageCaption = (followingHtml: string) => {
	const nextImageIndex = followingHtml.search(/<img\b/i)
	const candidateHtml =
		nextImageIndex >= 0
			? followingHtml.slice(0, nextImageIndex)
			: followingHtml

	const captionMatch = candidateHtml.match(
		/^\s*(?:<\/div>\s*)*(?:<div[^>]*>\s*)?<div[^>]*>\s*<p>(.*?)<\/p>\s*<\/div>/is,
	)
	const caption = stripHtml(captionMatch?.[1] || '') || undefined
	if (!caption) return undefined

	if (caption.length > 220) return undefined
	return caption
}

const addCoordinate = (
	coordinates: PageCoordinate[],
	seenKeys: Set<string>,
	source: string,
	latitude: number | undefined,
	longitude: number | undefined,
) => {
	if (latitude == null || longitude == null) return
	const key = `${latitude},${longitude}`
	if (seenKeys.has(key)) return
	seenKeys.add(key)
	coordinates.push({ source, latitude, longitude })
}

const extractPageCoordinates = (
	html: string,
	heritageItem: HeritagePageData | undefined,
) => {
	const coordinates: PageCoordinate[] = []
	const seenKeys = new Set<string>()

	addCoordinate(
		coordinates,
		seenKeys,
		'heritageItem',
		parseNumber(heritageItem?.item_lat),
		parseNumber(heritageItem?.item_long),
	)

	const inlineLatitudeMatch = html.match(
		/var\s+latitude\s*=\s*"?(-?\d+(?:\.\d+)?)"?\s*;/i,
	)
	const inlineLongitudeMatch = html.match(
		/var\s+longitude\s*=\s*"?(-?\d+(?:\.\d+)?)"?\s*;/i,
	)
	addCoordinate(
		coordinates,
		seenKeys,
		'inline-map-marker',
		parseNumber(inlineLatitudeMatch?.[1]),
		parseNumber(inlineLongitudeMatch?.[1]),
	)

	for (const href of extractAttributeValues(html, 'href')) {
		if (!href.includes('maps.google.com/maps?')) continue

		try {
			const mapUrl = new URL(href)
			const llValue = mapUrl.searchParams.get('ll')
			if (!llValue) continue
			const [latText, longText] = llValue.split(',')
			addCoordinate(
				coordinates,
				seenKeys,
				'google-map-center',
				parseNumber(latText),
				parseNumber(longText),
			)
		} catch {
			continue
		}
	}

	return coordinates
}

const extractHeritageItem = (html: string) => {
	const match = html.match(/var\s+heritageItem\s*=\s*(\{.*?\});/s)
	if (!match?.[1]) return undefined

	try {
		return JSON.parse(match[1]) as HeritagePageData
	} catch {
		return undefined
	}
}

const extractStructuredPageImages = (
	html: string,
	pageUrl: URL,
	pageCoordinates: PageCoordinate[],
) => {
	const records: PageImageRecord[] = []
	const seenUrls = new Set<string>()
	const imgPattern = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi

	for (const match of html.matchAll(imgPattern)) {
		const src = decodeHtml(match[1] || '').trim()
		const fullTag = match[0]
		const index = match.index ?? 0
		if (!src || !fullTag) continue

		const imageUrl = normalizeUrl(src, pageUrl)
		if (!imageUrl || seenUrls.has(imageUrl.href)) continue
		if (isBlacklistedImageUrl(imageUrl)) continue
		seenUrls.add(imageUrl.href)

		const followingHtml = html.slice(
			index + fullTag.length,
			index + fullTag.length + 1200,
		)
		const precedingHtml = html.slice(Math.max(0, index - 12000), index)
		const caption = extractImageCaption(followingHtml)
		const paragraphMatches = [...precedingHtml.matchAll(/<p>(.*?)<\/p>/gis)]
		const contextText = paragraphMatches
			.slice(-12)
			.map((paragraphMatch) => stripHtml(paragraphMatch[1] || ''))
			.filter(Boolean)
			.join(' ')
		const description = caption
		const alt = extractTagAttribute(fullTag, 'alt')
		const title = extractTagAttribute(fullTag, 'title')
		const yearCandidates = extractYears(
			[caption, title, alt, contextText].filter(Boolean).join(' '),
		)

		records.push({
			url: imageUrl.href,
			alt,
			title,
			caption,
			description,
			contextText: contextText || undefined,
			year: yearCandidates[0],
			yearCandidates,
			coordinates: [...pageCoordinates],
			latitude: pageCoordinates[0]?.latitude,
			longitude: pageCoordinates[0]?.longitude,
		})
	}

	return records
}

const writePageMetadata = (
	pagesRootDir: string,
	pageUrl: URL,
	heritageItem: HeritagePageData | undefined,
	categories: PageCategory[],
	coordinates: PageCoordinate[],
	images: PageImageRecord[],
) => {
	const pageFileName = pageFileNameForUrl(pageUrl, categories)
	const pageSlug = pageSlugForUrl(pageUrl)

	const pageRecord: CrawledPage = {
		url: pageUrl.href,
		pageFileName,
		pageSlug,
		categories,
		location: heritageItem?.location,
		coordinates: [...coordinates],
		latitude: coordinates[0]?.latitude,
		longitude: coordinates[0]?.longitude,
		heritageItem,
		images,
	}

	fs.writeFileSync(
		path.join(pagesRootDir, pageFileName),
		JSON.stringify(pageRecord, null, 2),
	)
	return pageRecord
}

const fetchText = async (url: URL) => {
	const response = await fetch(url, {
		headers: {
			'user-agent':
				'time-portals-image-scraper/1.0 (+https://github.com/chris/time-portals)',
		},
	})

	if (!response.ok) {
		throw new Error(
			`Failed to fetch ${url.href}: ${response.status} ${response.statusText}`,
		)
	}

	const contentType = response.headers.get('content-type') || ''
	if (!contentType.toLowerCase().includes('text/html')) {
		throw new Error(
			`Skipped non-HTML page ${url.href} (${contentType || 'unknown content type'})`,
		)
	}

	return response.text()
}

const discoverScopedPages = async (rootUrl: URL) => {
	const configuredSeedPages = DEFAULT_SEED_URLS.filter((seedUrl) => {
		try {
			return shouldQueuePage(new URL(seedUrl), rootUrl)
		} catch {
			return false
		}
	})

	if (configuredSeedPages.length > 0) {
		return {
			pages: configuredSeedPages,
			discoveryUrl: 'configured category seeds',
		}
	}

	const discoveryCandidates = [
		new URL(DEFAULT_DISCOVERY_URL),
		new URL(rootUrl.origin),
	]

	for (const discoveryUrl of discoveryCandidates) {
		try {
			const html = await fetchText(discoveryUrl)
			const scopedPages = new Set<string>()

			for (const link of extractAttributeValues(html, 'href')) {
				const candidate = normalizeUrl(link, discoveryUrl)
				if (!candidate) continue
				if (!shouldQueuePage(candidate, rootUrl)) continue
				scopedPages.add(candidate.href)
			}

			if (scopedPages.size > 0) {
				return {
					pages: [...scopedPages],
					discoveryUrl: discoveryUrl.href,
				}
			}
		} catch {
			continue
		}
	}

	return {
		pages: [],
		discoveryUrl: undefined,
	}
}

const downloadImage = async (
	imageUrl: URL,
	pageUrl: string,
	imagesRootDir: string,
	contentHashes: Set<string>,
	downloadedImages: DownloadedImage[],
) => {
	const response = await fetch(imageUrl, {
		headers: {
			'user-agent':
				'time-portals-image-scraper/1.0 (+https://github.com/chris/time-portals)',
		},
	})

	if (!response.ok) {
		throw new Error(
			`Failed to download image ${imageUrl.href}: ${response.status} ${response.statusText}`,
		)
	}

	const contentType =
		response.headers.get('content-type') || 'application/octet-stream'
	if (!contentType.toLowerCase().startsWith('image/')) {
		throw new Error(
			`Skipped non-image asset ${imageUrl.href} (${contentType})`,
		)
	}

	const arrayBuffer = await response.arrayBuffer()
	const buffer = Buffer.from(arrayBuffer)
	const sha256 = crypto.createHash('sha256').update(buffer).digest('hex')
	if (contentHashes.has(sha256)) return

	contentHashes.add(sha256)
	const pageDir = outputDirForPage(new URL(pageUrl))
	const imageDir = path.join(imagesRootDir, pageDir)
	ensureDir(imageDir)
	const fileName = fileNameForImage(
		imageUrl,
		contentType,
		sha256,
		downloadedImages.length + 1,
	)
	const relativePath = path.join(pageDir, fileName)
	fs.writeFileSync(path.join(imagesRootDir, relativePath), buffer)
	downloadedImages.push({
		url: imageUrl.href,
		fileName,
		relativePath,
		sha256,
		bytes: buffer.byteLength,
		contentType,
		firstSeenOn: pageUrl,
	})
	console.log(`Saved ${imageUrl.href} -> ${relativePath}`)
}

const run = async () => {
	const options = parseCliOptions(process.argv.slice(2))
	const rootUrl = new URL(options.startUrl)
	const startedAt = new Date().toISOString()
	const runId = `${sanitizeSegment(rootUrl.hostname)}-${startedAt.replace(/[:.]/g, '-')}`
	const outputDir = path.join(options.outputRoot, runId)
	const imagesDir = path.join(outputDir, 'images')
	const pagesDir = path.join(outputDir, 'pages')
	ensureDir(imagesDir)
	ensureDir(pagesDir)

	const pagesToVisit = [rootUrl.href]
	const seenPages = new Set<string>()
	const skippedPages = new Set<string>()
	const seenImageUrls = new Set<string>()
	const contentHashes = new Set<string>()
	const downloadedImages: DownloadedImage[] = []
	const crawledPageDetails: CrawledPage[] = []
	const downloadedImagePathsByUrl = new Map<string, string>()
	let seedPages = [rootUrl.href]

	while (pagesToVisit.length > 0 && seenPages.size < options.maxPages) {
		const nextPage = pagesToVisit.shift()
		if (!nextPage || seenPages.has(nextPage)) continue

		seenPages.add(nextPage)
		console.log(`Crawling ${nextPage}`)

		try {
			const pageUrl = new URL(nextPage)
			const html = await fetchText(pageUrl)
			const heritageItem = extractHeritageItem(html)
			const pageCategories = extractPageCategories(html, pageUrl)
			const pageCoordinates = extractPageCoordinates(html, heritageItem)
			const pageImages = extractStructuredPageImages(
				html,
				pageUrl,
				pageCoordinates,
			)
			writePageMetadata(
				pagesDir,
				pageUrl,
				heritageItem,
				pageCategories,
				pageCoordinates,
				pageImages,
			)
			const pageLinks = extractAttributeValues(html, 'href')
			const imageCandidates = [
				...extractImageTagValues(html),
				...extractSrcsetValues(html),
				...extractIconValues(html),
				...extractMetaImageValues(html),
			]

			for (const link of pageLinks) {
				const url = normalizeUrl(link, pageUrl)
				if (
					!url ||
					!shouldQueuePage(url, rootUrl) ||
					seenPages.has(url.href)
				) {
					continue
				}
				pagesToVisit.push(url.href)
			}

			for (const candidate of imageCandidates) {
				const imageUrl = normalizeUrl(candidate, pageUrl)
				if (!imageUrl || !isSameHostname(imageUrl, rootUrl)) continue
				if (isBlacklistedImageUrl(imageUrl)) continue
				const matchingPageImage = pageImages.find(
					(pageImage) => pageImage.url === imageUrl.href,
				)
				if (matchingPageImage?.downloadedRelativePath) continue
				if (downloadedImagePathsByUrl.has(imageUrl.href)) {
					if (matchingPageImage) {
						matchingPageImage.downloadedRelativePath =
							downloadedImagePathsByUrl.get(imageUrl.href)
					}
					continue
				}
				if (seenImageUrls.has(imageUrl.href)) continue
				seenImageUrls.add(imageUrl.href)

				try {
					await downloadImage(
						imageUrl,
						pageUrl.href,
						imagesDir,
						contentHashes,
						downloadedImages,
					)
					downloadedImagePathsByUrl.set(
						imageUrl.href,
						downloadedImages[downloadedImages.length - 1]
							?.relativePath ?? '',
					)
					if (matchingPageImage) {
						matchingPageImage.downloadedRelativePath =
							downloadedImages[
								downloadedImages.length - 1
							]?.relativePath
					}
				} catch (error) {
					console.warn(
						`Skipping image ${imageUrl.href}: ${error instanceof Error ? error.message : String(error)}`,
					)
				}
			}
			crawledPageDetails.push(
				writePageMetadata(
					pagesDir,
					pageUrl,
					heritageItem,
					pageCategories,
					pageCoordinates,
					pageImages,
				),
			)
		} catch (error) {
			skippedPages.add(nextPage)

			if (nextPage === rootUrl.href && seenPages.size === 1) {
				try {
					const discoveryResult = await discoverScopedPages(rootUrl)
					if (discoveryResult.pages.length > 0) {
						seedPages = discoveryResult.pages
						for (const discoveredPage of discoveryResult.pages) {
							if (!seenPages.has(discoveredPage)) {
								pagesToVisit.push(discoveredPage)
							}
						}
						console.warn(
							`Start page unavailable; discovered ${discoveryResult.pages.length} in-scope pages from ${discoveryResult.discoveryUrl ?? rootUrl.origin}`,
						)
						continue
					}
				} catch (discoveryError) {
					console.warn(
						`Failed to discover fallback pages for ${rootUrl.href}: ${discoveryError instanceof Error ? discoveryError.message : String(discoveryError)}`,
					)
				}
			}

			console.warn(
				`Skipping page ${nextPage}: ${error instanceof Error ? error.message : String(error)}`,
			)
		}
	}

	const manifest: CrawlManifest = {
		startUrl: rootUrl.href,
		hostname: rootUrl.hostname,
		pathScope: normalizePathScope(rootUrl.pathname),
		seedPages,
		startedAt,
		finishedAt: new Date().toISOString(),
		maxPages: options.maxPages,
		crawledPages: [...seenPages],
		skippedPages: [...skippedPages],
		pages: crawledPageDetails,
		downloadedImages,
	}

	fs.writeFileSync(
		path.join(outputDir, 'manifest.json'),
		JSON.stringify(manifest, null, 2),
	)

	console.log(`Crawled ${seenPages.size} pages`)
	console.log(`Downloaded ${downloadedImages.length} unique images`)
	console.log(`Saved output to ${outputDir}`)
}

run().catch((error) => {
	console.error(error)
	process.exit(1)
})
