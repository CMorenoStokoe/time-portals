<script lang="ts">
	import Previews from '$lib/components/previews/Previews.svelte';
	import SelectedLandmarkPreview from '$lib/components/previews/SelectedLandmarkPreview.svelte';
	import Share from '$lib/components/menu/Share.svelte';
	import SwipeMenu from '$lib/components/SwipeMenu.svelte';
	import type { eras } from '../../data/eras';

	const {
		selectedLandmark,
		landmarks,
		era,
		handleClickMarker,
		handleSelectView,
		showMenu,
		handleShowMenu
	}: {
		selectedLandmark?: App.Media.Metadata;
		landmarks: App.Media.Metadata[];
		era?: (typeof eras)[keyof typeof eras][number];
		handleClickMarker: (point: App.Media.Metadata) => void;
		handleSelectView: (newView: 'map' | 'landmark') => void;
		handleShowMenu: (value: boolean) => void;
		showMenu: { state: boolean; ref: number };
	} = $props();
</script>

<!-- Previews -->
<SwipeMenu {showMenu} {handleShowMenu}>
	<!-- Right buttons -->
	<nav class="fixed top-8 right-9 flex flex-row gap-2">
		{#if selectedLandmark}
			<Share landmark={selectedLandmark} />
		{/if}
	</nav>
	<!-- Selected landmark preview -->
	{#if selectedLandmark}
		<SelectedLandmarkPreview {selectedLandmark} {handleSelectView} />
	{/if}
	<!-- Bottom menu -->
	<div class="text-white">
		<p class="font-medium tracking-wide">{era?.era ?? 'Featured'}</p>
		{#if era}
			<p class="text-xs">{era.description}.</p>
		{/if}
	</div>
	<Previews {landmarks} {handleClickMarker} />
</SwipeMenu>
