import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { read } from '$app/server';
import path from 'path';
import fs from 'fs';

// Serves image/video media file to display scenes in <img> and <video> tags on the portal page
export const GET: RequestHandler = async ({ params, url }) => {
	// Construct and validate location media file path
	const slug: string = params.slug;
	const dir = path.resolve('src/lib/assets/locations'); // Asset directory containing media for all locations
	const folder = path.join(dir, slug); // Folder for this location's media
	if (!fs.existsSync(folder))
		throw error(404, 'Location not yet supported. Please ensure the URL is correct and try again.');

	// Get and parse metadata
	const metadataFile = path.join(folder, 'metadata.json');
	const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf-8'));
	const requestedYear: number = url.searchParams.get('year') ?? metadata.scenes[0].year; // Default to first scene if no year specified

	// Validate file exists and get media path
	const requestedMedia = url.searchParams.get('media') as 'image' | 'video';
	const mediaExt = fs.existsSync(path.join(folder, `${requestedYear}.mp4`))
		? 'mp4'
		: fs.existsSync(path.join(folder, `${requestedYear}.webm`))
			? 'webm'
			: fs.existsSync(path.join(folder, `${requestedYear}.png`))
				? 'png'
				: fs.existsSync(path.join(folder, `${requestedYear}.jpg`))
					? 'jpg'
					: '';
	const mediaPath = path.join(folder, `${requestedYear}.${mediaExt}`);
	const media = read(mediaPath);

	// Return media data as response (intended to be accessed with ?raw=true query param)
	return json(
		{
			metadata,
			media: {
				type: mediaExt === 'mp4' || mediaExt === 'webm' ? 'video' : 'image',
				ext: mediaExt,
				data: media.body
			}
		},
		{ 'Content-Type': requestedMedia === 'video' ? 'video/mp4' : 'image/png' }
	);

	new Response(media.body, {
		headers: {
			'Content-Type': requestedMedia === 'video' ? 'video/mp4' : 'image/png',
			'Cache-Control': 'public, max-age=3600' // Cache media for 1 hour to improve performance on repeat visits to the same portal
		}
	});
};
