<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import InteractionHint from '$lib/components/interaction-hint.svelte';
	import GyroPermissions from '$lib/components/gyroPermissions.svelte';
	import { useGyroScroll } from '$lib/utilities/useGyroScroll';
	import { centerOnLoad } from '$lib/utilities/centerOnLoad';
	let { data } = $props();
	const country = $derived(data.metadata.country);
	let viewport: HTMLDivElement | null = null;

	// States
	let showText = $state(false);
	let showHighlights = $state(false);
	let showInteractionHint = $state(true); // Hint users to interact until they do

	// Lifecycle
	onMount(() => {
		// Fade in text
		let timeout: NodeJS.Timeout;
		showText = true; // Show text
		timeout = setTimeout(() => {
			showText = false; // Hide text
			showHighlights = true; // Show highlights instead
		}, 3000);
		const hintTimeout = setTimeout(() => {
			showInteractionHint = false;
		}, 6000);

		// Cleanup on unmount
		return () => {
			clearTimeout(timeout);
			clearTimeout(hintTimeout);
		};
	});
</script>

<!-- Scroll viewport -->
<svelte:window ondeviceorientation={(e) => useGyroScroll(e, viewport)} />
<div bind:this={viewport} use:centerOnLoad class="h-dvh w-full overflow-auto">
	<!-- Media stage: all absolute overlays anchor to this full surface -->
	<div class="relative h-dvh w-max min-w-full overflow-hidden">
		<!-- Historical view -->
		{#if data.urls.video}
			<video
				class="block h-dvh w-auto max-w-none"
				preload="metadata"
				autoplay
				loop
				muted
				src="?raw=true&media=video"
				transition:fade
			>
			</video>
		{:else}
			<img
				class="block h-dvh w-auto max-w-none"
				src="?raw=true&media=image"
				transition:fade
				alt={data.metadata.description}
			/>
		{/if}

		<!-- Overlay text -->
		{#if showText}
			<div
				transition:fade
				class="absolute top-0 left-0 flex h-full w-full flex-col items-center justify-center text-center text-stone-900 drop-shadow-[0_50px_50px_white]"
			>
				<p class="font-body text-sm font-black drop-shadow-[0_5px_5px_white]">
					{data.metadata.country.toUpperCase()}
				</p>
				<p class="font-body text-2xl font-black drop-shadow-[0_10px_10px_white]">
					{data.metadata.location},
				</p>
				<p class="my-1 font-greek text-5xl font-bold drop-shadow-[0_15px_15px_white]">
					{data.metadata.year}
				</p>
			</div>
		{/if}

		<!-- Highlights -->
		{#each data?.metadata?.highlights as { x, y, text }, i (i)}
			{#if showHighlights}
				<div
					in:fade={{ delay: 750 + i * 500, duration: 500 }}
					class="group absolute flex max-h-12 max-w-12"
					style={`left: clamp(10rem, ${x * 100}%, calc(100% - 10rem)); top: clamp(10rem, ${y * 100}%, calc(100% - 10rem));`}
				>
					<div class="relative flex flex-col items-center justify-center">
						<p
							class="pointer-events-none absolute z-10 w-40 rounded bg-black/50 p-1 text-center font-display text-xs font-bold text-white opacity-0 transition-all group-hover:opacity-100"
						>
							{text}
						</p>
						<button
							class="icon absolute h-8 w-8 cursor-pointer rounded-full bg-black/50 p-1 text-white opacity-100 transition-all group-hover:opacity-0"
						>
							touch_app
						</button>
					</div>
				</div>
			{/if}
		{/each}

		<!-- Swipe/rotate hint-->
		{#if showInteractionHint}
			<InteractionHint class="absolute top-8 left-1/2 -translate-x-1/2" />
		{/if}

		<GyroPermissions onEnabled={() => (showInteractionHint = false)} />

		<!-- Logo -->
		<button
			class="absolute right-0 bottom-0 flex cursor-pointer flex-col items-center justify-center rounded-tl-4xl bg-stone-900 px-1 py-5 hover:scale-105"
			onclick={() => goto(resolve('/'))}
		>
			<img
				src="/svg/logo{country === 'Gibraltar' ? '-gibraltar' : ''}.svg"
				class="h-10 w-auto"
				alt="Logo"
			/>
		</button>
	</div>
</div>
