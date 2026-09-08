import type { RequestHandler } from './$types';

// Endpoint which flags a given landmark for removal from the app
export const POST: RequestHandler = async ({ request }) => {
	const { landmark } = await request.json();
	console.warn('User flagged landmark for removal from app data', JSON.stringify(landmark));
	return new Response();
};
