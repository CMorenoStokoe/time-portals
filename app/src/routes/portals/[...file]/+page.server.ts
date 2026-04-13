import type { PageServerLoad } from './$types';
import { getPortalFiles } from '$lib/utilities/getPortalFiles';

// Loads metadata for the location, including validating file paths for `+server.ts` to serve media
export const load: PageServerLoad = ({ params }): App.PageData['preload'] =>
	getPortalFiles(params.file);
