import type { PageServerLoad } from './$types';
import { preloadLocation } from '$lib/utilities/preloadLocation';

// Load location metadata and validate file paths for `+server.ts` before serving media
export const load: PageServerLoad = ({ params }): App.PageData =>
	preloadLocation(params.file);
