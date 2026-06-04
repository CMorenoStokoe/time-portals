import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { configDotenv } from 'dotenv'
configDotenv()

// Initialise LLM
export const llm = new ChatGoogleGenerativeAI({
	apiKey: process.env.GOOGLE_GEMINI_API_KEY as string,
	model: 'gemini-3.5-flash',
})
