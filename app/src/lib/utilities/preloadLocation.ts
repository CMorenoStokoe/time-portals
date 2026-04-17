import path from 'path';
import { error } from '@sveltejs/kit';

// Get media file paths and metadata for all locations
const images = import.meta.glob('../assets/locations/**/scene.png', {
	eager: true,
	import: 'default'
});
const videos = import.meta.glob('../assets/locations/**/scene.mp4', {
	eager: true,
	import: 'default'
});
const metafiles = import.meta.glob('../assets/locations/**/meta.json', {
	eager: true,
	import: 'default'
});

// Gets media preload data for a given location
export function preloadLocation(url: string): App.PageData {
	const urlPath = path.posix.join('../assets/locations', url.replace(/^\/+|\/+$/g, ''));

	// Get file paths
	const image = images[urlPath + '/scene.png'] as string | undefined;
	const video = videos[urlPath + '/scene.mp4'] as string | undefined;
	const metadata = metafiles[urlPath + '/meta.json'] as App.PageData['metadata'] | undefined;

	// Validate files
	if (!image || !metadata)
		throw error(404, 'Location not yet supported. Please ensure the URL is correct and try again.');
	if (!metadata.year)
		throw error(500, 'Location metadata is malformed. Please try another location');

	const preloadData: App.PageData = {
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
}
