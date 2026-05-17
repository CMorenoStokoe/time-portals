import type { PageServerLoad } from './$types';

const metafiles = import.meta.glob('$lib/assets/locations/**/meta.json', {
	eager: true,
	import: 'default'
});

interface LocationMeta {
	year: string;
	description: string;
	location: string;
	country: string;
}

interface LocationEntry {
	url: string;
	meta: LocationMeta;
}

export const load: PageServerLoad = () => {
	const locations: LocationEntry[] = Object.entries(metafiles).map(([filePath, meta]) => {
		// filePath: $lib/assets/locations/{slug1}/{slug2}/meta.json
		const match = filePath.match(/locations\/(.+)\/meta\.json$/);
		const url = match ? `/go/${match[1]}` : '';
		return { url, meta: meta as LocationMeta };
	});

	return { locations };
};
