import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { configDotenv } from 'dotenv'
configDotenv()

// Initialise image LLM/LIM
export const lim = new ChatGoogleGenerativeAI({
	apiKey: process.env.GOOGLE_GEMINI_API_KEY as string,
	model: 'gemini-2.5-flash-image',
})
