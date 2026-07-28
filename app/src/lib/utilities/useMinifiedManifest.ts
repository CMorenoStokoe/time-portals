import { manifest as rawManifest } from '$lib/data/manifest';

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

const mappedManifest = rawManifest.map((item) => ({
	...item,
	filename: toWebp(item.filename),
	referenceFilename: item.referenceFilename ? toWebp(item.referenceFilename) : undefined
}));

const filterExistingManifest = async () => {
	if (import.meta.env.SSR) {
		return mappedManifest;
	}

	const checks = await Promise.all(
		mappedManifest.map(async (item) => {
			try {
				const response = await fetch(`/media/${item.filename}`, { method: 'HEAD' });
				return { item, exists: response.ok };
			} catch {
				return { item, exists: false };
			}
		})
	);

	const filtered = checks.filter((result) => result.exists).map((result) => result.item);
	const excludedCount = mappedManifest.length - filtered.length;

	if (excludedCount > 0) {
		console.warn(
			`Warning: ${excludedCount} files in the manifest do not exist in /media and were excluded.`
		);
	}

	return filtered;
};

export const manifest = await filterExistingManifest();
