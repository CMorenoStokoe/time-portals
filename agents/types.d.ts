import {
	Annotation,
	StateGraph,
	StateType,
	BaseChannel,
	OverwriteValue,
	LastValue,
} from '@langchain/langgraph'

declare global {
	namespace Agent {
		// Base64-encoded image data
		export type Base64Image = string

		// Agent input and output types
		export interface Request {
			prompt?: string // Optional prompt for the agent
			image?: Base64Image // Optional base64-encoded image data
			// Metadata
			timestamp: string // ISO 8601
			runId: string // Unique run identifier
			agent: string // Agent name
		}

		export type Output = StateType<{
			// Request
			request: LastValue<AgentRequest>
			// Run metadata
			success: LastValue<boolean> // True if the agent completed successfully
			error?: LastValue<string> // Error message if the agent failed
			// Outputs
			[key: string]: LastValue<any> // Dynamic keys for agent outputs
		}>

		// Agent run functions
		export type Run = (request: AgentRequest) => Promise<AgentOutput>
	}
}
