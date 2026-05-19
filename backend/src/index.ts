// CLI entrypoint that runs the historical image graph.
import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = dirname(fileURLToPath(import.meta.url))
loadEnv({ path: resolve(currentDir, '../.env') })

process.env.LANGSMITH_TRACING ??= 'true'
process.env.LANGCHAIN_TRACING_V2 ??= process.env.LANGSMITH_TRACING
process.env.LANGCHAIN_CALLBACKS_BACKGROUND ??= 'false'
process.env.LANGSMITH_PROJECT ??= 'time-portals-backend'
process.env.LANGCHAIN_PROJECT ??= process.env.LANGSMITH_PROJECT
process.env.LANGSMITH_ENDPOINT ??= 'https://eu.api.smith.langchain.com'
if (process.env.LANGSMITH_ENDPOINT === 'https://api.smith.langchain.com') {
	process.env.LANGSMITH_ENDPOINT = 'https://eu.api.smith.langchain.com'
}
process.env.LANGCHAIN_ENDPOINT ??= process.env.LANGSMITH_ENDPOINT
if (process.env.LANGCHAIN_ENDPOINT === 'https://api.smith.langchain.com') {
	process.env.LANGCHAIN_ENDPOINT = 'https://eu.api.smith.langchain.com'
}
process.env.LANGCHAIN_API_KEY ??= process.env.LANGSMITH_API_KEY

const defaultRequest =
	"View of the Grand Battery and King's Lines during the Great Siege of Gibraltar, 1781. Include defensive earthworks."

const request = process.argv.slice(2).join(' ').trim() || defaultRequest

const run = async () => {
	const { historicalImageAgent } = await import('./pipeline.js')

	const finalState = await historicalImageAgent.invoke(
		{ request },
		{
			runName: 'time-portals-agent',
		},
	)

	console.log(JSON.stringify(finalState, null, 2))
}

run().catch((error) => {
	console.error('Pipeline execution failed:', error)
	process.exitCode = 1
})
