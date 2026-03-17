import { error, type RequestHandler } from '@sveltejs/kit';
import fs from 'node:fs';
import { Readable } from 'node:stream';
import path from 'node:path';

type MediaKind = 'video' | 'image';

const MEDIA_BY_EXTENSION: Record<string, { kind: MediaKind; mime: string }> = {
	'.mp4': { kind: 'video', mime: 'video/mp4' },
	'.webm': { kind: 'video', mime: 'video/webm' },
	'.mov': { kind: 'video', mime: 'video/quicktime' },
	'.jpg': { kind: 'image', mime: 'image/jpeg' },
	'.jpeg': { kind: 'image', mime: 'image/jpeg' },
	'.png': { kind: 'image', mime: 'image/png' },
	'.webp': { kind: 'image', mime: 'image/webp' },
	'.gif': { kind: 'image', mime: 'image/gif' },
	'.avif': { kind: 'image', mime: 'image/avif' }
};

function getMediaInfo(fileName: string) {
	const extension = path.extname(fileName).toLowerCase();
	return MEDIA_BY_EXTENSION[extension] ?? null;
}

function pickPreferredMedia(files: string[]) {
	const sortedFiles = [...files].sort((a, b) => a.localeCompare(b));
	const firstVideo = sortedFiles.find((fileName) => getMediaInfo(fileName)?.kind === 'video');
	if (firstVideo) {
		return firstVideo;
	}

	const firstImage = sortedFiles.find((fileName) => getMediaInfo(fileName)?.kind === 'image');
	if (firstImage) {
		return firstImage;
	}

	return null;
}

function parseRange(rangeHeader: string, fileSize: number) {
	const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
	if (!match) {
		return null;
	}

	const [, startText, endText] = match;

	if (startText === '' && endText === '') {
		return null;
	}

	if (startText === '') {
		const suffixLength = Number.parseInt(endText, 10);
		if (Number.isNaN(suffixLength) || suffixLength <= 0) {
			return null;
		}

		const length = Math.min(suffixLength, fileSize);
		return { start: fileSize - length, end: fileSize - 1 };
	}

	const start = Number.parseInt(startText, 10);
	if (Number.isNaN(start) || start < 0) {
		return null;
	}

	const end = endText === '' ? fileSize - 1 : Number.parseInt(endText, 10);
	if (Number.isNaN(end) || end < start) {
		return null;
	}

	if (start >= fileSize) {
		return { unsatisfiable: true as const };
	}

	return {
		start,
		end: Math.min(end, fileSize - 1)
	};
}

function createStreamResponse(filePath: string, headers: Record<string, string>, status = 200) {
	const nodeStream = fs.createReadStream(filePath);
	const webStream = Readable.toWeb(nodeStream) as ReadableStream;

	return new Response(webStream, {
		status,
		headers
	});
}

export const GET: RequestHandler = async ({ params, request }) => {
	const projectRoot = process.cwd();
	const filePayload = params.file || '';

	const requestedPath = path.join(projectRoot, 'portals', filePayload);

	if (!fs.existsSync(requestedPath)) throw error(404, `Path not found: ${filePayload}`);

	let resolvedPath: string;
	let fileName: string;

	if (fs.lstatSync(requestedPath).isDirectory()) {
		const preferredMedia = pickPreferredMedia(fs.readdirSync(requestedPath));

		if (!preferredMedia) {
			throw error(404, 'No supported video or image file found inside this directory.');
		}

		fileName = preferredMedia;
		resolvedPath = path.join(requestedPath, fileName);
	} else {
		fileName = path.basename(requestedPath);
		if (!getMediaInfo(fileName)) {
			throw error(415, `Unsupported file type: ${fileName}`);
		}
		resolvedPath = requestedPath;
	}

	const mediaInfo = getMediaInfo(fileName);
	if (!mediaInfo) {
		throw error(415, `Unsupported file type: ${fileName}`);
	}

	const stats = fs.statSync(resolvedPath);
	const fileSize = stats.size;
	const range = request.headers.get('range');
	const baseHeaders = {
		'Content-Length': fileSize.toString(),
		'Content-Type': mediaInfo.mime,
		'Accept-Ranges': mediaInfo.kind === 'video' ? 'bytes' : 'none'
	};

	if (mediaInfo.kind === 'video') {
		if (range) {
			const parsedRange = parseRange(range, fileSize);

			if (!parsedRange || 'unsatisfiable' in parsedRange) {
				return new Response(null, {
					status: 416,
					headers: { 'Content-Range': `bytes */${fileSize}` }
				});
			}

			const chunkSize = parsedRange.end - parsedRange.start + 1;
			const nodeStream = fs.createReadStream(resolvedPath, {
				start: parsedRange.start,
				end: parsedRange.end
			});
			const webStream = Readable.toWeb(nodeStream) as ReadableStream;

			return new Response(webStream, {
				status: 206,
				headers: {
					'Content-Range': `bytes ${parsedRange.start}-${parsedRange.end}/${fileSize}`,
					'Accept-Ranges': 'bytes',
					'Content-Length': chunkSize.toString(),
					'Content-Type': mediaInfo.mime
				}
			});
		}

		return createStreamResponse(resolvedPath, baseHeaders);
	}

	return createStreamResponse(resolvedPath, baseHeaders);
};
