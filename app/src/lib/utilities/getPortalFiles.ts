import path from 'path';
import fs from 'fs';
import { error } from '@sveltejs/kit';

// Gets files for a given location
export function getPortalFiles(url: string): App.PageData['preload'] {
	let fullPath: string;

	// Get directory path
	try {
		fullPath = path.resolve('portals', url);
		if (!fullPath || fs.readdirSync(fullPath).length === 0) throw new Error('Portal URL not found');
	} catch (err) {
		console.error(err);
		throw error(404, 'Location not yet supported. Please ensure the URL is correct and try again.');
	}

	// Get portal files in directory
	try {
		// Resolve image and video paths
		const image: string = path.join(fullPath, 'scene.png');
		let video: string | undefined = path.join(fullPath, 'scene.mp4');
		if (!fs.existsSync(video)) video = undefined;

		// Parse metadata
		const metadata: App.PageData['preload']['metadata'] = JSON.parse(
			fs.readFileSync(path.join(fullPath, 'meta.json'), 'utf-8')
		);

		// Validate files
		if (!fs.existsSync(image) || !metadata?.year)
			throw new Error('No media/metadata found for this location');

		const preloadData = {
			urls: {
				image,
				video
			},
			config: {
				isAnimated: Boolean(video)
			},
			metadata
		};
		return preloadData;
	} catch (err) {
		console.error(err, { debug: { fullPath, files: fs.readdirSync(fullPath) } });
		throw error(500, 'Internal error in accessing location media');
	}
}
