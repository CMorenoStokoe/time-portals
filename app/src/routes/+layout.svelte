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
		const timeout = setTimeout(() => {
			showSplash = false;
		}, 2000);
		return () => clearTimeout(timeout);
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if showSplash}
	<Splash />
{:else}
	{@render children()}
	<!-- Logo -->
	<img src="/svg/logo-gibraltar-xs.svg" class="absolute top-1 right-6 h-12 w-auto" alt="Logo" />
{/if}
