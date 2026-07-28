<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import Map from '../lib/components/Map.svelte';
	import Watermark from '../lib/components/Watermark.svelte';
	import Highlight from '../lib/components/Highlight.svelte';
	import { manifest } from '$lib/utilities/useMinifiedManifest';

	let viewport = $state<HTMLDivElement>();

	// States
	let userLocation = $state<{ latitude: number; longitude: number }>();
	let selectedLandmark = $state<App.Media.Metadata>();
	let isFadingInLocation = $state(false);
	let timeout: NodeJS.Timeout; // Handle timeouts within safe lifecycle
	let showOriginalImage = $state(false); // Option to show original image instead of AI-generated one
	let prefersImageToVideo = $state(false); // User preference for image or video

	// Center on load
	const centerViewport = () => {
		requestAnimationFrame(() => {
			if (!viewport) return;
			viewport.scrollLeft = (viewport.scrollWidth - viewport.clientWidth) / 2;
			viewport.scrollTop = (viewport.scrollHeight - viewport.clientHeight) / 2;
		});
	};

	// Handlers
	const handleGetUserLocation = async (e?: Event) =>
		navigator.geolocation.getCurrentPosition(
			({ coords }) => {
				userLocation = coords;
				// Select the closest landmark to user on first load unless they've already selected one
				handleSelectLandmark(userLocation);
			},
			(err) => {
				console.error('Error getting user location:', err);
			}
		);
	const handleSelectLandmark = async ({
		latitude,
		longitude,
		filename
	}: {
		latitude?: number;
		longitude?: number;
		filename?: string;
	}) => {
		console.log('Selecting landmark:', { latitude, longitude, filename });
		// Reset original/reference image flag
		showOriginalImage = false;
		prefersImageToVideo = false;
		// Get the closest location to the user
		selectedLandmark = filename
			? manifest.find((point) => point.filename === filename)
			: manifest.reduce(
					(closest: App.Media.Metadata, point: App.Media.Metadata) =>
						(point.latitude - latitude!) ** 2 + (point.longitude - longitude!) ** 2 <
						(closest.latitude - latitude!) ** 2 + (closest.longitude - longitude!) ** 2
							? point
							: closest,
					manifest[0]
				)!;
		// Fade in text
		clearTimeout(timeout); // Clear any existing timeout to avoid multiple timeouts running
		isFadingInLocation = true; // Show text
		timeout = setTimeout(() => {
			isFadingInLocation = false; // Hide text, show highlights instead
		}, 3000);
	};
	const handleSelectNextLandmark = () => {
		if (!selectedLandmark) return;
		const currentIndex = manifest.findIndex(
			(point) => point.filename === selectedLandmark!.filename
		);
		const nextNearestLandmark = manifest[(currentIndex + 1) % manifest.length];
		handleSelectLandmark(nextNearestLandmark);
	};

	// Lifecycle
	onMount(() => {
		// handleGetUserLocation(undefined); // Get user location on first load
	});
	onDestroy(() => {
		clearTimeout(timeout);
	});
</script>

{#if !selectedLandmark}
	<!-- Map -->
	<button
		class="absolute bottom-16 left-1/2 z-10 flex -translate-x-1/2 cursor-pointer flex-row items-center justify-between gap-2 rounded border-2 border-yellow-400 bg-red-500 p-2 font-display font-bold text-nowrap text-white hover:bg-red-600"
		onclick={handleGetUserLocation}
		><svg
			xmlns="http://www.w3.org/2000/svg"
			height="24px"
			viewBox="0 -960 960 960"
			width="24px"
			class="fill-yellow-400"
			><path
				d="M440-42v-80q-125-14-214.5-103.5T122-440H42v-80h80q14-125 103.5-214.5T440-838v-80h80v80q125 14 214.5 103.5T838-520h80v80h-80q-14 125-103.5 214.5T520-122v80h-80Zm238-240q82-82 82-198t-82-198q-82-82-198-82t-198 82q-82 82-82 198t82 198q82 82 198 82t198-82Zm-311-85q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47Zm169.5-56.5Q560-447 560-480t-23.5-56.5Q513-560 480-560t-56.5 23.5Q400-513 400-480t23.5 56.5Q447-400 480-400t56.5-23.5ZM480-480Z"
			/></svg
		> Use my current location</button
	>
	<button
		class="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 cursor-pointer flex-row items-center justify-between gap-2 rounded bg-stone-500 p-2 font-display font-bold text-nowrap text-stone-200 hover:bg-stone-800"
		onclick={() => handleSelectLandmark(manifest[Math.floor(Math.random() * manifest.length)])}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			height="24px"
			viewBox="0 -960 960 960"
			width="24px"
			class="fill-stone-200"
			><path
				d="M560-160v-80h104L537-367l57-57 126 126v-102h80v240H560Zm-344 0-56-56 504-504H560v-80h240v240h-80v-104L216-160Zm151-377L160-744l56-56 207 207-56 56Z"
			/></svg
		>
		I'm feeling lucky!</button
	>
	<Map onClickLandmark={handleSelectLandmark} />
{:else}
	<div bind:this={viewport} class="h-full w-full overflow-auto">
		<!-- Media-sized positioning wrapper -->
		<div class="relative mx-auto h-dvh w-max">
			{#key showOriginalImage ? selectedLandmark.referenceFilename : selectedLandmark.filename}
				<!-- Media -->
				{#if showOriginalImage}
					<img
						in:fade
						class="block h-dvh w-auto max-w-none"
						src={`/media/${selectedLandmark.referenceFilename}`}
						onload={centerViewport}
						alt={selectedLandmark.referenceFilename}
					/>
				{:else if selectedLandmark.hasAnimation && !prefersImageToVideo}
					<video
						in:fade
						class="block h-dvh w-auto max-w-none"
						preload="metadata"
						autoplay
						muted
						onloadedmetadata={centerViewport}
						loop
						src={`/media/${selectedLandmark.filename.replace(/\.[^.]+$/, '.mp4')}`}
					></video>
					<Watermark />
				{:else}
					<img
						in:fade
						class="block h-dvh w-auto max-w-none"
						src={`/media/${selectedLandmark.filename}`}
						onload={centerViewport}
						alt={selectedLandmark.filename}
					/>
				{/if}
			{/key}

			<!-- Highlights -->
			{#if !isFadingInLocation}
				{#each selectedLandmark.highlights as highlight, i (i)}
					<Highlight x={highlight.x} y={highlight.y} text={highlight.text} index={i} />
				{/each}
			{/if}
		</div>

		<!-- Fixed viewport UI -->
		<div
			class="fixed bottom-12 left-1/2 flex -translate-x-1/2 flex-row items-center justify-center gap-4"
		>
			<!-- Back button -->
			<button
				onclick={() => (selectedLandmark = undefined)}
				title="Back"
				class="flex cursor-pointer flex-row items-center justify-center gap-1 rounded-full bg-red-700 p-2 px-3 font-display font-bold text-white transition-all hover:scale-110"
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" class="h-6 w-6 fill-white"
					><path
						d="m600-120-240-84-186 72q-20 8-37-4.5T120-170v-560q0-13 7.5-23t20.5-15l212-72 240 84 186-72q20-8 37 4.5t17 33.5v560q0 13-7.5 23T812-192l-212 72Zm-40-98v-468l-160-56v468l160 56Zm80 0 120-40v-474l-120 46v468Zm-440-10 120-46v-468l-120 40v474Zm440-458v468-468Zm-320-56v468-468Z"
					/></svg
				>
				<p>Map</p>
			</button>

			<!-- Old/new media selection -->
			<div class="relative flex flex-col items-center justify-center">
				{#if selectedLandmark.referenceFilename}
					<button
						onclick={() => (showOriginalImage = !showOriginalImage)}
						class="flex cursor-pointer flex-row items-center justify-center gap-1 rounded bg-red-700 p-1 px-2 opacity-90 transition-all hover:scale-110 hover:opacity-100"
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
								class="h-8 w-8 fill-yellow-400 transition-all {showOriginalImage
									? '-scale-x-100'
									: ''}"
								><path
									d="M360-200h240l-79-103-58 69-39-52-64 86ZM320-80q-33 0-56.5-23.5T240-160v-320q0-33 23.5-56.5T320-560h320q33 0 56.5 23.5T720-480v320q0 33-23.5 56.5T640-80H320Zm0-80h320v-320H320v320ZM140-640q38-109 131.5-174.5T480-880q82 0 155.5 35T760-746v-134h80v240H600v-80h76q-39-39-90-59.5T480-800q-81 0-149.5 43T227-640h-87Zm180 480v-320 320Z"
								/></svg
							>Show <br />
							{showOriginalImage ? 'animated' : 'original'}
						</p>
					</button>
				{/if}
				<!-- Video/image switch -->
				{#if selectedLandmark.hasAnimation && !showOriginalImage}
					<button
						onclick={() => (prefersImageToVideo = !prefersImageToVideo)}
						class="absolute -top-14 h-10 w-10 shrink-0 cursor-pointer rounded bg-stone-800/10 transition-all hover:scale-110"
						title="Toggle video playback"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 -960 960 960"
							class="absolute top-1 right-1 h-8 w-8 fill-yellow-400/50 {!prefersImageToVideo
								? 'animate-spin'
								: ''}"
							><path
								d="M480-40q-108 0-202.5-49.5T120-228v108H40v-240h240v80h-98q51 75 129.5 117.5T480-120q115 0 208.5-66T820-361l78 18q-45 136-160 219.5T480-40ZM42-520q7-67 32-128.5T143-762l57 57q-32 41-52 87.5T123-520H42Zm214-241-57-57q53-44 114-69.5T440-918v80q-51 5-97 25t-87 52Zm449 0q-41-32-87.5-52T520-838v-80q67 6 128.5 31T762-818l-57 57Zm133 241q-5-51-25-97.5T761-705l57-57q44 52 69 113.5T918-520h-80Z"
							/></svg
						>
						{#if prefersImageToVideo}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 -960 960 960"
								class="absolute top-1 right-1 h-8 w-8 fill-yellow-400"
								><path
									d="m658-416-56-58-38-36-244-244v-6l440 280-102 64ZM790-56 520-328 320-200v-328L56-792l56-56 736 736-58 56ZM400-448Zm0 102 62-40-62-62v102Zm164-164Z"
								/></svg
							>
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 -960 960 960"
								class="absolute top-1 right-1 h-8 w-8 fill-yellow-400"
								><path d="M320-200v-560l440 280-440 280Z" /></svg
							>
						{/if}
					</button>
				{/if}
			</div>
			<!-- Next button -->
			<button
				onclick={handleSelectNextLandmark}
				title="Next"
				class="flex cursor-pointer flex-row items-center justify-center gap-1 rounded-full bg-slate-700 p-2 px-3 font-display font-bold text-white transition-all hover:scale-110"
			>
				<p>Next</p>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" class="h-6 w-6 fill-white"
					><path
						d="M383-480 200-664l56-56 240 240-240 240-56-56 183-184Zm264 0L464-664l56-56 240 240-240 240-56-56 183-184Z"
					/></svg
				>
			</button>
		</div>

		<!-- Report button -->
		<button
			onclick={() =>
				fetch('/api/flag-for-removal', {
					method: 'POST',
					body: JSON.stringify({ landmark: selectedLandmark })
				})}
			title="Report"
			class="fixed top-4 left-4 z-20 flex cursor-pointer flex-row items-center justify-center gap-1 px-3 font-display font-bold transition-all hover:scale-110"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				height="24px"
				viewBox="0 -960 960 960"
				width="24px"
				class="fill-red-700"
				><path
					d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240ZM330-120 120-330v-300l210-210h300l210 210v300L630-120H330Zm34-80h232l164-164v-232L596-760H364L200-596v232l164 164Zm116-280Z"
				/></svg
			>
		</button>

		<!-- Relative viewport UI -->
		{#if isFadingInLocation}
			<div
				transition:fade
				class="pointer-events-none fixed inset-0 z-10 flex flex-col items-center justify-center text-center text-stone-900"
			>
				<div class="relative">
					<div class="absolute -inset-12 -z-10 rounded-full bg-white/90 blur-2xl"></div>

					<p class="font-body text-sm font-black">
						{selectedLandmark.country.toUpperCase()}
					</p>
					<p class="font-body text-2xl font-black">
						{selectedLandmark.location},
					</p>
					<p class="my-1 font-greek text-5xl font-bold">
						{selectedLandmark.year}
					</p>
				</div>
			</div>
		{:else}
			<div
				transition:fade
				class="pointer-events-none fixed bottom-4 left-1/2 flex -translate-x-1/2 flex-row items-center justify-center gap-1 text-center font-display text-white/50 drop-shadow-[0_5px_5px_black]"
			>
				<p class="font-display text-xs drop-shadow-[0_5px_5px_black]">
					{selectedLandmark.location},
				</p>
				<p class="my-1 font-greek text-xs drop-shadow-[0_5px_5px_black]">
					{selectedLandmark.year}
				</p>
			</div>
		{/if}
	</div>
{/if}
