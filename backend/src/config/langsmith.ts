export const langsmithConfig = () => {
	process.env.LANGSMITH_TRACING = 'true'
	process.env.LANGSMITH_PROJECT = 'time-portals'
	process.env.LANGSMITH_ENDPOINT = 'https://eu.api.smith.langchain.com'
}
