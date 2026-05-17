Product Design Specification: History Lens Image Generation Pipeline

1. System Overview
   A multi-agent, cyclic generative pipeline designed to produce historically accurate architectural and topographical images. The system utilizes a Generator-Critic architecture to iteratively refine generated assets against strict historical constraints, preventing temporal anachronisms. The orchestration is handled via LangGraph, utilizing the Google Gemini stack for multimodal reasoning and image synthesis.

2. Architecture & Tech Stack
   Orchestration: @langchain/langgraph

LLM & Vision: gemini-1.5-pro (via @langchain/google-genai)

Image Synthesis: Google Imagen API (stubbed via tool call)

Schema Validation: zod for deterministic critic outputs

Language: TypeScript / Node.js

3. State Management & Loop Prevention
   The graph state maintains the mutation data across the generation lifecycle. Infinite loops during the Generator-Critic cycle are prevented via a deterministic revisionCount incrementor. The conditional router enforces a strict upper bound (MAX_REVISIONS = 3), triggering a hard circuit break and returning the latest asset regardless of approval status if the threshold is exceeded.

4. Agent Specifications
   4.1. The Generator Node
   Function: Expands sparse user requests into high-fidelity prompt directives. In revision cycles, it aggressively mutates the prompt to rectify constraints flagged by the Critic.

Input: Current graph state (User Request, Previous Prompt, QA Feedback).

Output: Generated Image URL, Updated Prompt, Revision Increment.

4.2. The Critic Node
Function: Multimodal QA. Ingests the synthesized image URL and the original constraints. Identifies anachronistic artifacts, material inconsistencies, or structural errors.

Output Enforcement: Utilizes LangChain's .withStructuredOutput() bounded by a Zod schema to guarantee a strongly typed JSON response, eliminating parsing volatility.

5. TypeScript Implementation Reference
   TypeScript
   import { Annotation, StateGraph, START, END } from "@langchain/langgraph";
   import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
   import { HumanMessage, SystemMessage } from "@langchain/core/messages";
   import { z } from "zod";

const MAX_REVISIONS = 3;

// 1. Graph State Definition
const GraphState = Annotation.Root({
request: Annotation<string>({ reducer: (x, y) => y ?? x }),
imagePrompt: Annotation<string>({ reducer: (x, y) => y ?? x }),
imageUrl: Annotation<string>({ reducer: (x, y) => y ?? x }),
qaFeedback: Annotation<string>({ reducer: (x, y) => y ?? x }),
revisionCount: Annotation<number>({
reducer: (x, y) => x + y,
default: () => 0,
}),
status: Annotation<"pending" | "approved" | "rejected">({
reducer: (x, y) => y ?? x,
default: () => "pending",
}),
});

// 2. Base Model Initialization
const llm = new ChatGoogleGenerativeAI({
modelName: "gemini-1.5-pro",
temperature: 0.2,
});

// 3. Structured Output Schema for Critic
const CriticSchema = z.object({
approved: z.boolean().describe("True if the image contains zero historical anachronisms."),
feedback: z.string().describe("Specific architectural or topographical corrections required. Empty if approved.")
});

const criticLlm = llm.withStructuredOutput(CriticSchema, { name: "historical_qa" });

// 4. External Tool Stub
const generateImageTool = async (prompt: string): Promise<string> => {
// Connect to Imagen API
return "https://storage.googleapis.com/history-lens-assets/draft-output.png";
};

// 5. Node Definitions
const generatorNode = async (state: typeof GraphState.State) => {
const systemPrompt = new SystemMessage(
"Construct a highly detailed image generation prompt focusing on period-accurate materials, lighting, and topography." +
(state.qaFeedback ? `\n\nCRITICAL FIXES REQUIRED: ${state.qaFeedback}` : "")
);

const response = await llm.invoke([systemPrompt, new HumanMessage(state.request)]);
const newPrompt = response.content as string;
const imageUrl = await generateImageTool(newPrompt);

return {
imagePrompt: newPrompt,
imageUrl: imageUrl,
revisionCount: 1
};
};

const criticNode = async (state: typeof GraphState.State) => {
const systemPrompt = new SystemMessage(
"Review the provided historical recreation against the target era. Flag modern artifacts or incorrect architectural styles."
);

const message = new HumanMessage({
content: [
{ type: "text", text: `Target Constraints: ${state.request}` },
{ type: "image_url", image_url: { url: state.imageUrl } }
]
});

const evaluation = await criticLlm.invoke([systemPrompt, message]);

return {
status: evaluation.approved ? "approved" : "rejected",
qaFeedback: evaluation.feedback
};
};

// 6. Routing Logic (Loop Prevention)
const evaluateQuality = (state: typeof GraphState.State) => {
if (state.status === "approved" || state.revisionCount >= MAX_REVISIONS) {
return END;
}
return "generator";
};

// 7. Graph Compilation
const pipeline = new StateGraph(GraphState)
.addNode("generator", generatorNode)
.addNode("critic", criticNode)
.addEdge(START, "generator")
.addEdge("generator", "critic")
.addConditionalEdges("critic", evaluateQuality);

export const historicalImageAgent = pipeline.compile();

// Example Execution
async function run() {
const finalState = await historicalImageAgent.invoke({
request: "View of the Grand Battery and King's Lines during the Great Siege of Gibraltar, 1781. Include defensive earthworks."
});

console.log(JSON.stringify(finalState, null, 2));
}
