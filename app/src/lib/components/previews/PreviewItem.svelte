<script lang="ts">
	import { fade } from 'svelte/transition';

	const {
		isSponsored,
		landmark,
		handleClickMarker
	}: {
		isSponsored: boolean; // Whether to highlight the preview as sponsored
		landmark: App.Media.Metadata;
		handleClickMarker: (point: App.Media.Metadata) => void;
	} = $props();

	// Construct url path
	const src = `/media/${landmark.filename}`;

	// Consutrct function to load in image and return resolved once loaded
	const loadImage = () =>
		new Promise<string>((resolve, reject) => {
			const img = new Image();
			img.src = src;
			img.onload = () => resolve(src);
			img.onerror = reject;
		});
</script>

<!-- Preview of a landmark -->
<button class="relative flex flex-col" transition:fade onclick={() => handleClickMarker(landmark)}>
	{#await loadImage()}
		<!-- Placeholder -->
		<div
			class="h-20 max-h-20 min-h-20 w-16 max-w-16 min-w-16 animate-pulse rounded bg-slate-500 object-cover"
		></div>
	{:then}
		<!-- Loaded image-->
		<img
			class="h-20 max-h-20 min-h-20 w-16 max-w-16 min-w-16 rounded object-cover shadow-inner {isSponsored
				? 'border border-gibraltar-accent/75'
				: ''}"
			{src}
			alt={landmark.location}
		/>
	{/await}
	<!-- Text background -->
	<div
		class="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 rounded bg-linear-to-t from-black/90 via-black/60 to-transparent"
	></div>
	<!-- Text (title, year) -->
	<p class="absolute top-1 right-1 font-greek text-xs text-white text-shadow-black text-shadow-lg">
		{landmark.year}
	</p>
	<p
		class="absolute inset-x-1 bottom-1 line-clamp-2 text-xs leading-tight text-white text-shadow-black text-shadow-lg"
	>
		{landmark.location}
	</p>
</button>
