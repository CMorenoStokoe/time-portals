<script lang="ts">
	import { getEra } from '$lib/data/eras';

	const {
		selectedLandmark,
		handleSelectView
	}: {
		selectedLandmark: App.Media.Metadata;
		handleSelectView: (newView: 'map' | 'landmark') => void;
	} = $props();

	// Construct url path
	const src = $derived(`/media/${selectedLandmark.filename}`);
	const srcOriginal = $derived(
		selectedLandmark.referenceFilename ? `/media/${selectedLandmark.referenceFilename}` : null
	);

	// Get era for the selected landmark
	const { era, years, historicalness, icon } = $derived(
		getEra(selectedLandmark.year, selectedLandmark.country)
	);

	// Construct function to load in image and return resolved once loaded
	const loadImage = () =>
		new Promise<string>((resolve, reject) => {
			const img = new Image();
			img.src = src;
			img.onload = () => resolve(src);
			img.onerror = reject;
		});
</script>

<button class="mt-2 flex flex-col gap-2 text-start" onclick={() => handleSelectView('landmark')}>
	<!-- Landmark title -->
	<p class="pr-20 font-body font-medium tracking-wide text-white">
		{selectedLandmark.location}, {selectedLandmark.year}
	</p>
	<!-- Era -->
	<div class="flex flex-row gap-1">
		<img
			class="h-4 w-4 rounded-xl border border-white bg-gibraltar-primary p-px"
			style="filter: {historicalness > 50 ? 'grayscale' : 'sepia'}({historicalness}%);"
			src={icon}
			alt="era"
		/>
		<p class="text-xs text-white">{era} ({years})</p>
	</div>
	<!-- Animated tag -->
	{#if selectedLandmark.hasAnimation}
		<div class="flex flex-row gap-1 text-white">
			<icon
				class="flex h-4 w-4 items-center justify-center rounded-full border border-white bg-gibraltar-accent"
				style="font-variation-settings:'FILL' 1;">play_arrow</icon
			>
			<p class="text-xs">This site is animated</p>
		</div>
	{/if}

	<!-- Large preview of the currently selected landmark -->
	<div class="flex flex-row gap-2">
		{#await loadImage()}
			<!-- Placeholder -->
			<div
				class="h-40 max-h-40 min-h-40 w-40 max-w-40 min-w-40 animate-pulse rounded bg-slate-500 object-cover"
			></div>
		{:then}
			<!-- Loaded image-->
			<div class="relative">
				<img
					class="h-40 max-h-40 min-h-40 w-40 max-w-40 min-w-40 rounded object-cover shadow-inner"
					{src}
					alt={selectedLandmark.location}
				/>
				<div class="absolute top-1 right-1 text-2xl text-white text-shadow-black text-shadow-md">
					<icon>fullscreen</icon>
				</div>
			</div>
		{/await}
		<!-- Side content -->
		<div class="flex flex-col gap-2">
			{#if srcOriginal}
				<img
					class="h-20 max-h-20 min-h-20 w-20 max-w-20 min-w-20 rounded object-cover shadow-inner"
					src={srcOriginal}
					alt={selectedLandmark.location}
				/>
			{/if}
			{#if selectedLandmark.hasAnimation}
				<div class="relative flex items-center justify-center">
					<img
						class="h-20 max-h-20 min-h-20 w-20 max-w-20 min-w-20 rounded object-cover shadow-inner"
						{src}
						alt={selectedLandmark.location}
					/>
					<icon
						class="absolute text-4xl text-white text-shadow-md"
						style="font-variation-settings:'FILL' 1;">play_arrow</icon
					>
				</div>
			{/if}
			<div
				class="flex flex-row items-center justify-center gap-2 rounded bg-gibraltar-accent px-2 py-1 font-display font-bold text-black"
			>
				View <icon>fullscreen</icon>
			</div>
		</div>
		<!-- Description -->
		<div>
			<p class="text-xs text-white">{selectedLandmark.description}</p>
		</div>
	</div>
</button>
