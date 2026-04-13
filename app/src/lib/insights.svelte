<script lang="ts">
	import { fade } from 'svelte/transition';

	export let metadata: App.PageData['metadata'];

	// States
	let isActive = false;

	// Handlers
	const handleMouseEnter = () => {
		console.log(metadata);
		isActive = true;
	};
</script>

{#each metadata.highlights as highlight (highlight.title)}
	<button
		class="absolute flex flex-col space-y-1"
		style="top: {highlight.y * 100}%; left: {highlight.x * 100}%;"
		onmouseenter={handleMouseEnter}
		onclick={() => (isActive = !isActive)}
		onmouseleave={() => (isActive = false)}
	>
		<div class="h-20 w-20 rounded-full">!</div>
		{#if isActive}<p transition:fade class="text-xs">{highlight.text}</p>{/if}
	</button>
{/each}
