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
			interface Metadata {
				country: string;
				location: string;
				latitude: number;
				longitude: number;
				heading: number;
				pitch: number;
				year: number;
				filename: string;
				highlights: {
					x: number;
					y: number;
					text: string;
				}[];
				referenceFilename?: string; // Base image reference
				ai?: true; // Indicates if the image was ai generated or not
				hasAnimation?: boolean; // Indicates if the image has an animation or not
			}
		}
	}
}

export {};
