import { manifest as rawManifest } from '$lib/data/manifest';

const mediaFiles = import.meta.glob(['/static/media/*.webp', '/static/media/*.mp4']);
const availableMedia = new Set(
	Object.keys(mediaFiles).map((file) => file.split('/').at(-1)!.replace(/\.mp4$/, '.webp'))
);

const thumbnailFiles = import.meta.glob('/static/media/thumbnails/*.webp');
const availableThumbnails = new Set(
	Object.keys(thumbnailFiles).map((file) => file.split('/').at(-1)!)
);

// Normalise manifest so it uses optimised files
// src/lib/toWebp.ts

export const toWebp = (filename: string) => {
	let hash = 0xcbf29ce484222325n;

	for (const character of filename.normalize('NFC').toLowerCase()) {
		hash ^= BigInt(character.codePointAt(0)!);
		hash = BigInt.asUintN(64, hash * 0x100000001b3n);
	}

	return `${hash.toString(16).padStart(16, '0')}.webp`;
};

const mappedManifest = rawManifest.map((item) => {
	const webpFilename = toWebp(item.filename);
	return {
		...item,
		filename: webpFilename,
		referenceFilename: item.referenceFilename ? toWebp(item.referenceFilename) : undefined,
		thumbnailFilename: availableThumbnails.has(webpFilename) ? webpFilename : undefined
	};
});

export const manifest = mappedManifest.filter((item) => availableMedia.has(item.filename));
