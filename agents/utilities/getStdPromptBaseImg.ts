import fs from 'fs'
import path from 'path'
import { getInputDir } from '../cfg/dir'

// Gets base image regardless of extension from database
export const getStdPromptBaseImg = (
	agent: string,
	agentRun: string,
	folder: string,
): Agent.Base64Image | undefined => {
	// Establish correct file extension for base image (prompt.png/jpg/webm)
	let extension: string | undefined = undefined
	const POSSIBLE_EXTENSIONS = [
		'png',
		'jpg',
		'jpeg',
		'webm',
		'gif',
		'bmp',
		'tiff',
		'svg',
	]
	POSSIBLE_EXTENSIONS.forEach((ext) => {
		const fileWithExtExists = fs.existsSync(
			path.join(getInputDir(agent, agentRun), folder, `prompt.${ext}`),
		)
		if (fileWithExtExists) extension = ext
	})
	if (extension)
		return fs.readFileSync(
			path.join(
				getInputDir(agent, agentRun),
				folder,
				`prompt.${extension}`,
			),
			'base64',
		)
	else return undefined
}
