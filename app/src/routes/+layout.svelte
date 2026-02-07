<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="flex flex-row justify-center gap-4 p-4 font-serif font-bold text-slate-100">
	<h1 class="text-2xl">Time Portals</h1>
</div>

<div class="flex flex-col items-center justify-center gap-2 p-8">
	{@render children()}
</div>
