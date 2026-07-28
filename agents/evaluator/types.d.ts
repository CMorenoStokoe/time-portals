import { GraphState as GraphStateObj } from './graph.js'

// Graph state
export type EvaluatorGraphState = typeof GraphStateObj.State

// Input types
export type EvaluatorRequest = {
	location?: string // Location
	period?: string // Historical period expressed as a year, range of years, or name of the period
	generatedImg: Base64Image // base64-encoded image data for the subject image to be evaluated
	baseImg: Base64Image // base64-encoded image data of the base reference image
}
