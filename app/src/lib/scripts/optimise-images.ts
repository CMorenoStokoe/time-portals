import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const inputFolder = path.resolve('static/media/old');
const outputFolder = path.resolve('static/media/optimised');

const toSharpPath = (filePath: string) => {
	if (process.platform !== 'win32') return filePath;
	if (filePath.startsWith('\\\\?\\')) return filePath;
	return `\\\\?\\${path.resolve(filePath)}`;
};

// src/lib/toWebp.ts
export const toWebp = (filename: string) => {
	let hash = 0xcbf29ce484222325n;

	for (const character of filename.normalize('NFC').toLowerCase()) {
		hash ^= BigInt(character.codePointAt(0)!);
		hash = BigInt.asUintN(64, hash * 0x100000001b3n);
	}

	return `${hash.toString(16).padStart(16, '0')}.webp`;
};
await fs.mkdir(outputFolder, { recursive: true });

for (const filename of await fs.readdir(inputFolder)) {
	const extension = path.extname(filename).toLowerCase();

	if (!['.jpg', '.jpeg', '.png'].includes(extension)) continue;

	const input = path.join(inputFolder, filename);
	const outputFilename = toWebp(filename);
	const output = path.join(outputFolder, outputFilename);
	const sharpInput = toSharpPath(input);
	const sharpOutput = toSharpPath(output);

	const original = await sharp(sharpInput).metadata();

	await sharp(sharpInput)
		.rotate()
		.resize({
			width: 1920,
			withoutEnlargement: true
		})
		.webp({
			quality: 80,
			effort: 4
		})
		.toFile(sharpOutput);

	const optimised = await sharp(sharpOutput).metadata();

	console.log(
		`${filename} → ${outputFilename}: ` +
			`${original.width}×${original.height} → ` +
			`${optimised.width}×${optimised.height}`
	);
}
