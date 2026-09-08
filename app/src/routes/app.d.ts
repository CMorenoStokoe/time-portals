// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	// Functional app types
	namespace App {
		// interface Error {}
		// interface Locals {}
		interface PageData {
			metadata: Media.Metadata;
			data?: {
				image?: Buffer;
				video?: Buffer;
			};
		}
		// interface PageState {}
		// interface Platform {}

		// Media metadata types
		namespace Media {
			type LocationType =
				| 'nature'
				| 'transport'
				| 'civic'
				| 'commercial'
				| 'military'
				| 'other'
				| 'religious'
				| 'medical'
				| 'cultural'
				| 'residential'
				| 'industrial'
				| 'government'
				| 'monument'
				| 'market';

			interface Metadata {
				// Landmark information
				country: string;
				location: string;
				locationType?: LocationType;
				description?: string;
				year: number;
				highlights: {
					x: number;
					y: number;
					text: string;
				}[];
				// Location
				latitude: number;
				longitude: number;
				heading?: number;
				pitch?: number;
				// Media data
				filename: string;
				referenceFilename?: string; // Base image reference
				ai?: true; // Indicates if the image was ai generated or not
				hasAnimation?: boolean; // Indicates if the image has an animation or not
				// Content management
				disabled?: boolean; // If disabled to temporarily remove from display
			}
		}
	}
}

export {};
