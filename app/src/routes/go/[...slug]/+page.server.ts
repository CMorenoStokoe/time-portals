import type { PageServerLoad } from './$types';
import path from 'path';
import fs from 'fs';
import { json } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

// Load location metadata and validate file paths for `+server.ts` before serving media
export const load: PageServerLoad = ({ params }) => {
	// Construct and validate location media file path
	const slug: string = params.slug;
	const dir = path.resolve('src/lib/assets/locations'); // Asset directory containing media for all locations
	const folder = path.join(dir, slug); // Folder for this location's media

	// Get and parse metadata
	const metadataFile = path.join(folder, 'metadata.json');
	const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf-8')) as App.Media.Metadata;

	if (!fs.existsSync(metadataFile))
		throw error(404, 'Location not yet supported. Please ensure the URL is correct and try again.');

	return json(metadata);
};
