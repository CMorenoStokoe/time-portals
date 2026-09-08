/* Type defs for sharp module */
declare module 'sharp' {
	type Metadata = {
		width?: number;
		height?: number;
	};

	type ResizeOptions = {
		width?: number;
		withoutEnlargement?: boolean;
	};

	type WebpOptions = {
		quality?: number;
		effort?: number;
	};

	interface Sharp {
		metadata(): Promise<Metadata>;
		resize(options: ResizeOptions): Sharp;
		rotate(): Sharp;
		toFile(output: string): Promise<unknown>;
		webp(options: WebpOptions): Sharp;
	}

	export default function sharp(input: string): Sharp;
}
