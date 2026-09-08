<script lang="ts">
	import Map from '$lib/components/map/Map.svelte';
	import Portal from '$lib/components/portal/Portal.svelte';
	import { manifest } from '$lib/utilities/useMinifiedManifest';

	// States
	let selectedLandmark = $state<App.Media.Metadata>();
	let view = $state<'map' | 'landmark'>('map'); // Current view state
	let showMenu = $state({ state: false, ref: 1 });

	// Handlers
	const handleShowMenu = (value: boolean) => (showMenu = { state: value, ref: showMenu.ref + 1 });
	const handleSelectView = (newView: 'map' | 'landmark') => (view = newView);
	const handleSelectLandmark = async ({
		latitude,
		longitude,
		filename,
		justGiveNext
	}: {
		latitude?: number;
		longitude?: number;
		filename?: string;
		justGiveNext?: boolean;
	} = {}) => {
		if (justGiveNext)
			return (selectedLandmark =
				manifest[manifest.findIndex((point) => point.filename === selectedLandmark?.filename) + 1]);
		// Get selected landmark
		selectedLandmark = filename
			? manifest.find((point) => point.filename === filename)
			: // Get the closest location to the user
				latitude && longitude
				? manifest.reduce(
						(closest: App.Media.Metadata, point: App.Media.Metadata) =>
							(point.latitude - latitude!) ** 2 + (point.longitude - longitude!) ** 2 <
							(closest.latitude - latitude!) ** 2 + (closest.longitude - longitude!) ** 2
								? point
								: closest,
						manifest[0]
					)!
				: // Clear landmark on no selection
					undefined;
	};
</script>

{#if view === 'map' || !selectedLandmark}
	<Map
		country="Gibraltar"
		{handleSelectView}
		{handleSelectLandmark}
		{handleShowMenu}
		{showMenu}
		{selectedLandmark}
	/>
{:else if view === 'landmark'}
	<Portal {handleSelectView} {selectedLandmark} />
{/if}
