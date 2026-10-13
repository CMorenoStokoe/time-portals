<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	// Add vercel analytics
	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import { onMount } from 'svelte';
	import Splash from '../lib/components/Splash.svelte';
	injectSpeedInsights();
	injectAnalytics({ mode: dev ? 'development' : 'production' });

	// Show splash on first load
	let showSplash = $state(true);
	onMount(() => {
		void import('mapbox-gl').then(({ default: mapboxgl }) => {
			mapboxgl.prewarm();
		});

		const timeout = setTimeout(() => {
			showSplash = false;
		}, 2000);
		return () => clearTimeout(timeout);
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<!-- Outer centered wrapper -->
<div class="flex h-dvh w-full justify-center overflow-hidden bg-stone-950 font-body">
	<!-- Mobile frame -->
	<div
		class="relative h-dvh w-full max-w-md overflow-hidden bg-black shadow-2xl sm:border-x sm:border-stone-800"
	>
		{@render children()}

		<!-- Overlays -->
		{#if showSplash}
			<!-- Splash -->
			<Splash />
		{/if}
	</div>
</div>
