import { GraphState as GraphStateObj } from './graph.js'

// Graph state
export type GeneratorV1GraphState = typeof GraphStateObj.State

// Input types
export type GeneratorV1Request = {
	image_url: Base64Image // base64-encoded image data for the subject image to be evaluated
	metadata: Record<string, any> // filename of the subject image
}
