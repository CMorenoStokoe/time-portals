import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { read } from '$app/server';
import { preloadLocation } from '$lib/utilities/preloadLocation';

// Serves image/video media file to display scenes in <img> and <video> tags on the portal page
export const GET: RequestHandler = async ({ params, url }) => {
	try {
		const preload = preloadLocation(params.file);
		const requestedMedia = url.searchParams.get('media') as 'image' | 'video';
		const mediaPath = requestedMedia === 'video' ? preload.urls.video : preload.urls.image;

		if (!mediaPath) {
			throw error(404, 'Requested media file not found');
		}

		const media = read(mediaPath);

		// Return response (intended to be accessed with ?raw=true query param)
		return new Response(media.body, {
			headers: {
				'Content-Type': requestedMedia === 'video' ? 'video/mp4' : 'image/png',
				'Cache-Control': 'public, max-age=3600' // Cache media for 1 hour to improve performance on repeat visits to the same portal
			}
		});
	} catch (err) {
		console.error(err);
		throw error(500, 'Internal error in serving location media');
	}
};
