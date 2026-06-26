import { langsmithConfig } from './cfg/langsmith'
import { getInputDir } from './cfg/dir'
import { configDotenv } from 'dotenv'
configDotenv() // Load environment variables from .env file
langsmithConfig() // Load LangSmith configuration

// Specify current experiment run names
const CURRENT_RUN_ID = {
	evaluator: 'exp-1-poc',
}

// Entrypoint function to run a model, initialise logging, and handle errors
const agent = (process.argv[2] || 'evaluator') as keyof typeof CURRENT_RUN_ID // Selected agent from CLI arg
const agentRun = CURRENT_RUN_ID[agent] // Get the current run ID for the selected agent

switch (agent) {
	case 'evaluator':
		const evaluatorInputs = getInputDir(agent, agentRun)
}
