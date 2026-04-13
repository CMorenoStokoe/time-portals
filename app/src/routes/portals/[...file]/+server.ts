import type { RequestHandler } from './$types';
import fs from 'node:fs';
import { error } from '@sveltejs/kit';
import { getPortalFiles } from '$lib/utilities/getPortalFiles';

// Serves image/video media file to display scenes in <img> and <video> tags on the portal page
export const GET: RequestHandler = async ({ params, url }) => {
	try {
		const preload = getPortalFiles(params.file);
		const requestedMedia = url.searchParams.get('media') as 'image' | 'video';

		const media = fs.readFileSync(
			requestedMedia === 'video' ? preload.urls.video! : preload.urls.image
		);

		// Return response (intended to be accessed with ?raw=true query param)
		return new Response(media, {
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
