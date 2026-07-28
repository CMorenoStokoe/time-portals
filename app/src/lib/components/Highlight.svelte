<!-- Highlight.svelte -->
<script lang="ts">
	import { onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';

	let {
		x,
		y,
		text,
		index
	}: {
		x: number;
		y: number;
		text: string;
		index: number;
	} = $props();

	let isOpen = $state(false);
	let timeout = null;

	// Handlers
	const handleOpen = () => {
		isOpen = !isOpen;
		timeout = setTimeout(() => {
			isOpen = false;
		}, 3000);
	};

	onDestroy(() => {
		if (timeout) clearTimeout(timeout);
	});
</script>

<div
	in:fade={{ delay: 750 + index * 500, duration: 500 }}
	class="group absolute"
	style={`left: ${Math.min(Math.max(x, 0.1), 0.9) * 100}%; top: ${Math.min(Math.max(y, 0.1), 0.9) * 100}%;`}
>
	<p
		class:opacity-100={isOpen}
		class:opacity-0={!isOpen}
		class="pointer-events-none absolute z-10 w-40 -translate-x-1/2 -translate-y-full rounded bg-black/50 p-1 text-center font-display text-xs font-bold text-white transition-opacity group-hover:opacity-100"
	>
		{text}
	</p>

	<button
		type="button"
		aria-label={`Show highlight: ${text}`}
		aria-expanded={isOpen}
		onclick={handleOpen}
		class="icon h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-pointer touch-manipulation rounded-full bg-black/50 p-1 text-white transition-all group-hover:opacity-0"
	>
		touch_app
	</button>
</div>
