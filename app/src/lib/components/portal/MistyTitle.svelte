<script lang="ts">
	import { onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';

	let { selectedLandmark } = $props();

	let timeout: NodeJS.Timeout; // Handle timeouts within safe lifecycle
	let showTitleSplash = $state(false);

	// Show on mount
	$effect(() => {
		showTitleSplash = true;
		if (timeout) clearTimeout(timeout); // Clear any existing timeout to avoid multiple timeouts running
		timeout = setTimeout(() => {
			showTitleSplash = false;
		}, 3000);
	});
	onDestroy(() => clearTimeout(timeout)); // Safely destroy on unmount
</script>

<!-- Landmark introduction -->
<div
	transition:fade
	class="pointer-events-none fixed z-10 flex flex-col items-center text-stone-900 transition-all duration-700 ease-out {showTitleSplash
		? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center'
		: 'top-2 right-5 max-w-50 text-end'}"
>
	<!-- Mist -->
	<div
		class="absolute -z-10 rounded-full transition-all {showTitleSplash
			? '-inset-12 bg-white/90 blur-2xl'
			: ''}"
	></div>
	<!-- Text -->
	<p class="transition-all {showTitleSplash ? 'max-w-xs' : ' [text-shadow:0_0_2px_white]'}">
		<span class="font-body font-bold {showTitleSplash ? 'text-2xl' : 'text-base'}  transition-all">
			{selectedLandmark.location},
		</span>
		{#if showTitleSplash}
			<br />
		{/if}
		<span
			class="my-1 font-greek {showTitleSplash
				? 'text-5xl font-bold'
				: 'text-base font-normal'} transition-all"
		>
			{selectedLandmark.year}
		</span>
	</p>
</div>
