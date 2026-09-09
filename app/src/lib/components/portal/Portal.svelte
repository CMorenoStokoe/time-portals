<script lang="ts">
	import { fade } from 'svelte/transition';
	import Watermark from '$lib/components/portal/Watermark.svelte';
	import Highlight from '$lib/components/portal/Highlight.svelte';
	import MistyTitle from '$lib/components/portal/MistyTitle.svelte';
	import { onMount } from 'svelte';

	let viewport = $state<HTMLDivElement>();

	const {
		selectedLandmark,
		handleSelectView
	}: {
		selectedLandmark: App.Media.Metadata;
		handleSelectView: (newView: 'map' | 'landmark') => void;
	} = $props();

	let showOriginalImage = $state(false); // Option to show original image instead of AI-generated one
	// let prefersImageToVideo = $state(false); // User preference for image or video

	// Center on load
	const centerViewport = () => {
		requestAnimationFrame(() => {
			if (!viewport) return;
			viewport.scrollLeft = (viewport.scrollWidth - viewport.clientWidth) / 2;
			viewport.scrollTop = (viewport.scrollHeight - viewport.clientHeight) / 2;
		});
	};
	onMount(centerViewport);
</script>

<!-- Landmark view on select -->
<div class="bg-color-dark fixed inset-0 z-0">
	<!-- Nav button -->
	<button
		class="fixed top-2 left-2 z-10 flex h-8 w-8 flex-col items-center justify-center rounded-full bg-stone-600 text-2xl text-stone-100"
		onclick={() => handleSelectView('map')}><icon>arrow_back</icon></button
	>
	<div bind:this={viewport} class="h-full w-full overflow-auto" style="scrollbar-width: thin;">
		<!-- Media-sized positioning wrapper -->
		<div
			class="relative mx-auto h-dvh w-max"
			style="scrollbar-width: thin; scrollbar-color: rgba(0, 0, 0, 0.3) transparent;"
		>
			{#key showOriginalImage ? selectedLandmark.referenceFilename : selectedLandmark.filename}
				<!-- Media -->
				{#if showOriginalImage}
					<img
						in:fade
						class="block h-dvh w-auto max-w-none"
						src={`/media/${selectedLandmark.referenceFilename}`}
						alt={selectedLandmark.referenceFilename}
						onloadedmetadata={() => centerViewport()}
					/>
				{:else if selectedLandmark.hasAnimation}
					<video
						in:fade
						class="block h-dvh w-auto max-w-none"
						preload="metadata"
						autoplay
						muted
						loop
						src={`/media/${selectedLandmark.filename.replace(/\.[^.]+$/, '.mp4')}`}
						onloadedmetadata={() => centerViewport()}
					></video>
					<Watermark {selectedLandmark} />
				{:else}
					<img
						in:fade
						class="block h-dvh w-auto max-w-none"
						src={`/media/${selectedLandmark.filename}`}
						alt={selectedLandmark.filename}
						onloadedmetadata={() => centerViewport()}
					/>
				{/if}
			{/key}

			<!-- Highlights -->
			{#each selectedLandmark.highlights as highlight, i (i)}
				<Highlight x={highlight.x} y={highlight.y} text={highlight.text} delay={1600 + i * 400} />
			{/each}
		</div>

		<!-- Media selection control -->
		{#if selectedLandmark.referenceFilename}
			<button
				onclick={() => (showOriginalImage = !showOriginalImage)}
				class="fixed bottom-16 left-1/2 flex -translate-x-14 cursor-pointer flex-row items-center justify-center gap-1 rounded bg-red-700 p-1 px-2 opacity-90 transition-all hover:scale-110 hover:opacity-100"
				style="background-image: linear-gradient(rgb(0 0 0 / 40%), rgb(0 0 0 / 40%)),
					url(/media/{showOriginalImage
					? selectedLandmark.filename
					: selectedLandmark.referenceFilename}); background-size: cover; background-position: center;"
			>
				<p
					class="text-shadow-xl flex flex-row items-center justify-center gap-1 font-display font-bold text-white drop-shadow-[0_15px_15px_black] text-shadow-black"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 -960 960 960"
						class="h-8 w-8 fill-yellow-400 transition-all {showOriginalImage ? '-scale-x-100' : ''}"
						><path
							d="M360-200h240l-79-103-58 69-39-52-64 86ZM320-80q-33 0-56.5-23.5T240-160v-320q0-33 23.5-56.5T320-560h320q33 0 56.5 23.5T720-480v320q0 33-23.5 56.5T640-80H320Zm0-80h320v-320H320v320ZM140-640q38-109 131.5-174.5T480-880q82 0 155.5 35T760-746v-134h80v240H600v-80h76q-39-39-90-59.5T480-800q-81 0-149.5 43T227-640h-87Zm180 480v-320 320Z"
						/></svg
					>Show <br />
					{showOriginalImage ? 'animated' : 'original'}
				</p>
			</button>
		{/if}

		<!-- Landmark introduction -->
		<MistyTitle {selectedLandmark} />
	</div>
</div>
