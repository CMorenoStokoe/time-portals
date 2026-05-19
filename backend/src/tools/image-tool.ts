// Image generation tool stub until Imagen API wiring is added.
export const generateImageTool = async (prompt: string): Promise<string> => {
	const encodedPrompt = encodeURIComponent(prompt.slice(0, 80))
	return `https://storage.googleapis.com/history-lens-assets/draft-output.png?hint=${encodedPrompt}`
}
