import { error, type RequestHandler } from '@sveltejs/kit';
import fs from 'node:fs';
import { Readable } from 'node:stream';
import path from 'node:path';

export const GET: RequestHandler = async ({ params, request }) => {
    const PROJECT_ROOT = process.cwd();
    const filePayload = params.file || ''; 
    let filePath = path.join(PROJECT_ROOT, 'portals', filePayload);

    // 1. EXISTENCE CHECK
    if (!fs.existsSync(filePath)) {
        throw error(404, `Path not found: ${filePayload}`);
    }

    // 2. DIRECTORY RESOLUTION (The "Choice B" Logic)
    if (fs.lstatSync(filePath).isDirectory()) {
        const filesInDir = fs.readdirSync(filePath);
        // Look for the first video file available
        const videoFile = filesInDir.find(f => 
            f.endsWith('.mp4') || f.endsWith('.webm') || f.endsWith('.mov')
        );
        
        if (videoFile) {
            filePath = path.join(filePath, videoFile);
        } else {
            throw error(404, 'No supported video file found inside this directory.');
        }
    }

    // 3. FILE STATS
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    const range = request.headers.get('range');

    // 4. STREAMING LOGIC (With Safety Guards)
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const endPart = parseInt(parts[1], 10);
        
        // Ensure end isn't NaN and doesn't exceed file size
        const end = !isNaN(endPart) ? endPart : fileSize - 1;

        // CRITICAL: Prevent the "Received -1" error
        // Ensure start/end are valid positive integers within file bounds
        const safeStart = Math.max(0, start);
        const safeEnd = Math.min(end, fileSize - 1);

        if (safeStart > safeEnd) {
            return new Response(null, { 
                status: 416, 
                headers: { 'Content-Range': `bytes */${fileSize}` } 
            });
        }

        const chunksize = (safeEnd - safeStart) + 1;
        const nodeStream = fs.createReadStream(filePath, { start: safeStart, end: safeEnd });
        const webStream = Readable.toWeb(nodeStream) as ReadableStream;

        return new Response(webStream, {
            status: 206,
            headers: {
                'Content-Range': `bytes ${safeStart}-${safeEnd}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize.toString(),
                'Content-Type': 'video/mp4', // You can use 'mime' lib here for accuracy
            }
        });
    }

    // 5. FULL FILE SERVE (If no Range requested)
    const nodeStream = fs.createReadStream(filePath);
    const webStream = Readable.toWeb(nodeStream) as ReadableStream;

    return new Response(webStream, {
        headers: {
            'Content-Length': fileSize.toString(),
            'Content-Type': 'video/mp4',
            'Accept-Ranges': 'bytes'
        }
    });
};