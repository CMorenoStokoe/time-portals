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
			interface SceneHighlight {
				x: number;
				y: number;
				text: string;
			}
			interface Scene {
				year: number;
				description: string;
				highlights: SceneHighlight[];
			}
			interface Metadata {
				country: string;
				location: string;
				latitude: number;
				longitude: number;
				heading: number;
				pitch: number;
				scenes: Scene[];
			}
		}
	}
}

export {};
