import { GraphState as GraphStateObj } from './graph.ts'

// Graph state
export type GraphState = typeof GraphStateObj.State

// Input types
export type Request = {
	locationName: string
	xCoord: number
	yCoord: number
	referenceBase: string // Modern day google street view
	baseImageUrl?: string // Direct URL or data URI for the current street-view frame
}

// Agent output types
export type Agent = (...params: any) => Promise<Partial<GraphState>>
export type ResearchHighlight = {
	highlightName: string
	visualDescription: string
	popoverText: string
}

export type ResearchHighlightWithLocation = {
	highlightName: string
	visualDescription: string
	popoverText: string
	popoverLocationX: number // Pct
	popoverLocationY: number
}

export type Research = {
	location: string
	eventName: string
	eventYear: number
	eventHighlights: ResearchHighlight[]
}

export type QA = {
	pass: boolean
	feedback: string
	runs: number
}

// Formatted output types
export type AppMetadata = {
	year: number
	description: string
	country: string
	location: string
	highlights: {
		x: number
		y: number
		text: string
	}[]
}
