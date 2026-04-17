<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	let { data } = $props();

	// States
	let innerWidth = $state(0);
	let innerHeight = $state(0);
	let showRotateHint = $derived(innerHeight > innerWidth);
	let showText = $state(false);
	let showHighlights = $state(false);

	// Lifecycle
	onMount(() => {
		// Fade in text
		let timeout: NodeJS.Timeout;
		showText = true; // Show text
		timeout = setTimeout(() => {
			showText = false; // Hide text
			showHighlights = true; // Show highlights instead
			timeout = setTimeout(() => {
				showRotateHint = false; // Hide rotate hint
			}, 15000); // Give lots of time for people to notice
		}, 3000);
		return () => clearTimeout(timeout);
	});
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<!-- Portal view -->
<div class="relative flex h-full min-w-full flex-col items-center justify-center">
	<!-- Content (src is current {url}/?raw=true)-->
	{#if data.urls.video}
		<video
			class="h-full w-full object-cover"
			controls={null}
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
			src="?raw=true&media=image"
			transition:fade
			alt={data.metadata.description}
			class="h-full w-full object-cover"
		/>
	{/if}

	<!-- Overlay text -->
	{#if showText}
		<div
			transition:fade
			class="absolute top-1/3 text-center text-stone-900 drop-shadow-[0_50px_50px_white]"
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
</div>

<!-- Top bar -->
<div class="absolute top-3 left-3 flex flex-row items-center justify-start space-x-2">
	<!-- Rotate hint for portrait -->
	{#if !showText && showRotateHint}
		<!-- Info button -->
		<button onclick={() => (showRotateHint = false)}>
			<icon
				class="icon rotate-hint-icon cursor-pointer pt-1 text-3xl! text-black/45 hover:text-black"
				style="font-variation-settings: 'FILL' 1;">screen_rotation</icon
			>
		</button>
		<button
			class="flex cursor-pointer items-center gap-2 rounded-full bg-black/45 px-3 py-1 font-medium text-stone-200"
			in:fade={{ duration: 250 }}
			onclick={() => (showRotateHint = false)}
		>
			<span class="font-body text-xs text-stone-300">Rotate for best experience</span>
		</button>
	{/if}
</div>

<!-- Logo -->
<button
	class="absolute bottom-4 left-3 cursor-pointer hover:scale-105"
	onclick={() => goto(resolve('/'))}
>
	<img src="/svg/logo.svg" class="h-10 w-auto" alt="Logo" />
</button>

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

<style>
	.rotate-hint-icon {
		animation: rotate-nudge 3s ease-in-out infinite;
	}
	@keyframes rotate-nudge {
		0%,
		25% {
			opacity: 0;
			transform: rotate(90deg);
		}
		30% {
			opacity: 1;
		}
		60%,
		90% {
			transform: rotate(-45deg);
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}
</style>
