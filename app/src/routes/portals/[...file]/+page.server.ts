// src/routes/media/[...file]/+page.server.ts
import fs from 'node:fs/promises';
import path from 'node:path';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const fileParam = params.file;
		const fullPath = path.resolve('portals', fileParam);
		const entries = await fs.readdir(fullPath, { withFileTypes: true });
		const firstFile = entries.find((entry) => entry.isFile());

		if (!firstFile) throw new Error('No files found');

		const year = path.parse(firstFile.name).name;
		const type = path.extname(firstFile.name).slice(1) === 'mp4' ? 'video' : 'image';

		return { year, type };
	} catch (err) {
		console.error(err);
		throw error(404, 'File not found');
	}
};
