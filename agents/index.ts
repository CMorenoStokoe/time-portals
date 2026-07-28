import { langsmithConfig } from './cfg/langsmith'
import { getInputDir, getOutDir } from './cfg/dir'
import { configDotenv } from 'dotenv'
import fs from 'node:fs'
import path from 'node:path'
import { version as evaluatorAgentVer } from './evaluator/version.json'
import { version as generatorAgentVer } from './generator-v0/version.json'
import { evaluator } from './evaluator/index'
import { getStdPromptBaseImg } from './utilities/getStdPromptBaseImg'
import { getNonPromptImages } from './utilities/getNonPromptImages'
import { generatorV1Agent } from './generator-v1/agent'
import { version as generatorV1AgentVer } from './generator-v1/version.json'
import { getMimeType } from './utilities/getMimeType'
import { generatorV1 } from './generator-v1'

configDotenv() // Load environment variables from .env file
langsmithConfig() // Load LangSmith configuration

type Agent = 'evaluator' | 'generator' | 'generatorV1'

/**
 * # Agent Batch Entrypoint
 *
 * @description This script serves as the entry point for running different agents in the system as batch processes.
 * It initializes logging, handles errors, and determines which agent to run based on command-line arguments.
 * Each agent will be executed with its respective inputs and its outputs will be logged accordingly.
 *
 * @param {Record} Input - The input data required for the agent to run, which is determined by the agent type and its version.
 * @param {Record} Output - The output data produced by the agent after execution, which will be logged and stored for further analysis.
 */

// Entrypoint function to run a model, initialise logging, and handle errors
const agent = (process.argv[2] || 'evaluator') as Agent // Selected agent from CLI arg
const agentRun =
	agent === 'evaluator'
		? evaluatorAgentVer
		: agent === 'generatorV1'
			? generatorV1AgentVer
			: generatorAgentVer // Get the current run ID for the selected agent

const run = async () => {
	switch (agent) {
		// Generator V1
		case 'generatorV1':
			// Get images to transform
			const generatorV1Inputs = fs.readdirSync(
				getInputDir(agent, agentRun),
			)
			console.log(`Got ${generatorV1Inputs.length} input image files`)

			// Transform each
			for (const image_file of generatorV1Inputs) {
				let attempts = 1
				while (attempts < 3) {
					try {
						console.log(
							`Transforming ${image_file} (attempt ${attempts})`,
						)
						const image = fs.readFileSync(
							`${getInputDir(agent, agentRun)}/${image_file}`,
						)
						const imageBase64 = image.toString('base64')
						const image_url = `data:${getMimeType(image_file)};base64,${imageBase64}` // Google GenAI requires data URLs for inline image content
						const request = { image_url } // Create request object for the generator agent
						const result = await generatorV1(request)
						console.log(`Finished transforming ${image_file}`)

						// Save
						console.log('Saving', image_file)
						const outputFilePath = `${getOutDir(agent, agentRun)}/${image_file}.json`
						const outputImage =
							result.generation.content[0].inlineData.data
						const revisedImage =
							result.revision?.content[0].inlineData.data
						fs.mkdirSync(path.dirname(outputFilePath), {
							recursive: true,
						})
						fs.writeFileSync(
							outputFilePath,
							JSON.stringify(
								{ ...result, generation: outputImage },
								null,
								2,
							),
						)
						const outputImagePath = `${getOutDir(agent, agentRun)}/${image_file}.png`
						fs.writeFileSync(
							outputImagePath,
							Buffer.from(outputImage, 'base64'),
						)
						if (revisedImage)
							fs.writeFileSync(
								`${getOutDir(agent, agentRun)}/${image_file}-revised.png`,
								Buffer.from(revisedImage, 'base64'),
							)
						console.log(`Saved outputs for ${image_file}`)
						if (result.reEvaluation)
							console.info(
								'Automatically improved image quality by',
								result.reEvaluation?.score -
									result.evaluation?.score,
								'points',
							)
						attempts = 3 // Exit loop on success
					} catch (error) {
						console.error(error)
					} finally {
						attempts++
					}
				}
			}
			break

		// Evaluator
		case 'evaluator':
			// Get images for evaluation
			const evaluatorInputs = fs
				// Get list of folders which each contain a base reference image (prompt.png/jpg/webm) and multiple generated images (*.png/jpg/webm)
				.readdirSync(getInputDir(agent, agentRun))
				// Recursively search folders for nested images as above
				.map((folder) => ({
					folder,
					baseImageUrl: getStdPromptBaseImg(agent, agentRun, folder), // Base reference image
					images: getNonPromptImages(agent, agentRun, folder),
				}))
			console.log(
				'Got inputs:',
				evaluatorInputs.length,
				evaluatorInputs[0],
			)
			// Record evaluations for each image
			const evaluatorOutputs = []
			for (const folder of evaluatorInputs.slice(0, 1)) {
				for (const image of folder.images.slice(0, 1)) {
					console.log(`Evaluating ${folder}/${image}`)
					const result = await evaluator({
						location: folder.folder,
						generatedImg: image,
						baseImg: folder.baseImageUrl,
					})
					evaluatorOutputs.push(result)
					console.log(`Finished evaluating ${folder}/${image}`)
				}
				console.log(
					`Finished evaluating ${evaluatorOutputs.length} images`,
				)
				const summaryFilePath = `${getOutDir(agent, agentRun)}/summary.json`
				console.log('Saving summary', evaluatorOutputs)
				fs.writeFileSync(
					summaryFilePath,
					JSON.stringify(evaluatorOutputs, null, 2),
				)
				console.log(
					`Batch evaluation completed (summary: ${summaryFilePath})`,
				)
				break
			}
	}
}
run()
	.then(() => {
		console.log(`Agent ${agent} run completed successfully.`)
		process.exit(0)
	})
	.catch((err) => {
		console.error('Error running agent:', err)
		process.exit(1)
	})
