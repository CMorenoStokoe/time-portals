import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { configDotenv } from 'dotenv'
configDotenv()

// Initialise LLM instances
export const llm = {
	google: {
		// Gemini
		image: new ChatGoogleGenerativeAI({
			apiKey: process.env.GOOGLE_GEMINI_API_KEY as string,
			model: 'gemini-3.1-flash-image',
		}),
		chat: new ChatGoogleGenerativeAI({
			apiKey: process.env.GOOGLE_GEMINI_API_KEY as string,
			model: 'gemini-3.5-flash',
		}),
	},
}
