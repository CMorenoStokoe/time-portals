import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const inputFolder = path.resolve('static/media');
const outputFolder = path.resolve('static/media/thumbnails');

const toSharpPath = (filePath: string) => {
	if (process.platform !== 'win32') return filePath;
	if (filePath.startsWith('\\\\?\\')) return filePath;
	return `\\\\?\\${path.resolve(filePath)}`;
};

await fs.mkdir(outputFolder, { recursive: true });

const files = await fs.readdir(inputFolder);
const webpFiles = files.filter(
	(filename) =>
		filename.toLowerCase().endsWith('.webp') &&
		filename !== 'thumbnails' &&
		filename !== 'old' &&
		filename !== 'optimised' &&
		filename !== 'videos'
);

console.log(`Found ${webpFiles.length} WebP images in ${inputFolder}. Generating thumbnails in ${outputFolder}...`);

let totalOriginalBytes = 0;
let totalThumbBytes = 0;
let generatedCount = 0;
let skippedCount = 0;

const forceRegenerate = process.argv.includes('--force');

for (const filename of webpFiles) {
	const input = path.join(inputFolder, filename);
	const output = path.join(outputFolder, filename);

	const sharpInput = toSharpPath(input);
	const sharpOutput = toSharpPath(output);

	try {
		// Check if thumbnail already exists
		if (!forceRegenerate) {
			try {
				const existingStat = await fs.stat(output);
				if (existingStat.isFile() && existingStat.size > 0) {
					skippedCount++;
					continue;
				}
			} catch {
				// File does not exist, proceed
			}
		}

		const originalStat = await fs.stat(input);
		totalOriginalBytes += originalStat.size;

		await sharp(sharpInput)
			.rotate()
			.resize({
				height: 200,
				withoutEnlargement: true
			})
			.webp({
				quality: 75,
				effort: 4
			})
			.toFile(sharpOutput);

		const thumbStat = await fs.stat(output);
		totalThumbBytes += thumbStat.size;
		generatedCount++;

		if (generatedCount % 50 === 0 || generatedCount === webpFiles.length) {
			console.log(`Generated ${generatedCount} thumbnails...`);
		}
	} catch (err) {
		console.error(`Failed to generate thumbnail for ${filename}:`, err);
	}
}

const originalMB = (totalOriginalBytes / (1024 * 1024)).toFixed(2);
const thumbMB = (totalThumbBytes / (1024 * 1024)).toFixed(2);
const savingsPercent = totalOriginalBytes > 0
	? (((totalOriginalBytes - totalThumbBytes) / totalOriginalBytes) * 100).toFixed(1)
	: '0';

console.log(`\nCompleted thumbnail generation:`);
console.log(`- New thumbnails generated: ${generatedCount}`);
console.log(`- Skipped existing: ${skippedCount}`);
if (generatedCount > 0) {
	console.log(`- Original size of processed images: ${originalMB} MB`);
	console.log(`- Thumbnail size: ${thumbMB} MB (${savingsPercent}% reduction)`);
}
