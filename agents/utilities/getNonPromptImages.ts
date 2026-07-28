import fs from 'fs'
import path from 'path'
import { getInputDir } from '../cfg/dir'

// Gets base image regardless of extension from database
export const getNonPromptImages = (
	agent: string,
	agentRun: string,
	folder: string,
): Agent.Base64Image[] => {
	// Get all files
	const allFiles = fs.readdirSync(
		path.join(getInputDir(agent, agentRun), folder),
	)
	const nonPromptImageFiles = allFiles.filter(
		(file) =>
			!file.includes('prompt') &&
			/\.(png|jpg|jpeg|webm|gif|bmp|tiff|svg)$/.test(file),
	)

	// Establish correct file extension for base image (prompt.png/jpg/webm)
	const nonPromptImages = nonPromptImageFiles.map((file) =>
		fs.readFileSync(
			path.join(getInputDir(agent, agentRun), folder, file),
			'base64',
		),
	)

	return nonPromptImages
}
