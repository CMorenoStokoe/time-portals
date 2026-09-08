<script lang="ts">
	import PreviewItem from './PreviewItem.svelte';

	const {
		landmarks,
		handleClickMarker
	}: {
		landmarks: App.Media.Metadata[];
		handleClickMarker: (point: App.Media.Metadata) => void;
	} = $props();
</script>

<!-- Previews -->
<div class="flex max-w-full flex-wrap gap-2">
	{#each landmarks as landmark, i (landmark.filename)}
		<PreviewItem {landmark} isSponsored={i === 0} {handleClickMarker} />
	{/each}
</div>
