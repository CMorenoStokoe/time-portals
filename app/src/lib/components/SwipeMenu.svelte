<script lang="ts">
	import type { Snippet } from 'svelte';
	import { swipeSheet } from '$lib/browser/controls/swipeSheet';

	let {
		children,
		handleShowMenu,
		showMenu
	}: {
		children: Snippet;
		handleShowMenu: (value: boolean) => void;
		showMenu: { state: boolean; ref: number };
	} = $props();

	// Refs
	let scrollDiv = $state<HTMLElement | null>(null);

	// Handlers
	$effect(() => {
		showMenu.state;
		showMenu.ref;
		scrollDiv?.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	});
</script>

<div
	use:swipeSheet={{ initialExpanded: showMenu.state, onToggle: handleShowMenu }}
	class="fixed bottom-0 z-10 w-full overflow-hidden rounded-t-3xl bg-black/70 px-4 pt-16 pb-2 backdrop-blur"
	style="scrollbar-color: rgba(0, 0, 0, 0.3) transparent;"
	data-drag-handle
>
	<button
		type="button"
		class="pointer-events-auto absolute top-3 left-1/2 flex h-8 w-8 -translate-x-1/2 rotate-90 text-5xl text-stone-400"
		onclick={() => handleShowMenu(!showMenu.state)}
		><icon class={showMenu.state ? 'ml-1' : 'mr-1'}
			>{showMenu.state ? 'arrow_menu_open' : 'arrow_menu_close'}</icon
		></button
	>
	<div
		bind:this={scrollDiv}
		class="pointer-events-auto flex h-full min-h-0 flex-col gap-4 overflow-x-hidden overflow-y-auto"
	>
		{@render children()}
	</div>
</div>
