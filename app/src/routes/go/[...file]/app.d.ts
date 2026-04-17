// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		interface PageData {
			urls: {
				image: string;
				video?: string;
			};
			config: {
				isAnimated: boolean;
			};
			metadata: {
				year: number;
				description: string;
				country: string;
				location: string;
				highlights: {
					x: number;
					y: number;
					text: string;
				}[];
			};
			media?: {
				image?: Buffer;
				video?: Buffer;
			};
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
