// Factory to generate QA node
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { llm } from '../models/llm.js'
import { GraphState } from '../types.js'
import { QASchema } from './common/QASchema.js'

// Define pass requirements for QA evaluation of the present output
const requirements = [
	'The event must be a single, specific historical year (not a range or vague time period)',
	'The event must be associated with the location in the researcher node output',
	'There must be exactly 3 highlights provided, and they must be relevant to the event and location',
	'The event and all of its highlights MUST be strictly visible in the base image perspective as described by the describer node output',
]

// Factory for QA agents which validate an output against criteria
export const researcherQA = async (state: GraphState) =>
	await llm
		.withStructuredOutput(QASchema)
		.invoke([
			new SystemMessage(
				`Ensure this research output meets the following specifications:`.concat(
					requirements.join(),
				),
			),
			new HumanMessage(JSON.stringify(state.research)),
		])
		.then((research_QA) => {
			return { research_QA }
		})
