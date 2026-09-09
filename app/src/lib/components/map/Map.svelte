<script lang="ts">
	import { onMount } from 'svelte';
	import mapboxgl from 'mapbox-gl';
	import 'mapbox-gl/dist/mapbox-gl.css';
	import { manifest } from '$lib/utilities/useMinifiedManifest';
	import { CONFIG } from '$lib/config/CONFIG';
	import { applyOverlappingMarkerJitter } from '$lib/utilities/applyOverlappingMarkerJitter';
	import { createLandmark } from './createLandmark';
	import { eras, getEra } from '$lib/data/eras';
	import MenuBar from '$lib/components/menu/MenuBar.svelte';
	import EraSelection from './EraSelection.svelte';

	const GIBRALTAR_COORDS: [number, number] = [-5.3538, 36.1415];

	let {
		country,
		handleSelectLandmark,
		handleSelectView,
		selectedLandmark,
		handleShowMenu,
		showMenu
	}: {
		country: string;
		handleSelectLandmark: (location?: { filename: string }) => void;
		handleSelectView: (newView: 'map' | 'landmark') => void;
		handleShowMenu: (value: boolean) => void;
		selectedLandmark?: App.Media.Metadata;
		showMenu: { state: boolean; ref: number };
	} = $props();

	// Refs
	let container: HTMLDivElement;
	let map: mapboxgl.Map;
	let mapMarkers: mapboxgl.Marker[] = [];
	let mapClickMarker: mapboxgl.Marker;
	let navControls: mapboxgl.NavigationControl;
	let locationControls: mapboxgl.GeolocateControl;
	let offset: Record<string, [number, number]> = {};

	// States
	let filters = $state<{ era?: string }>({});
	let era = $derived(eras[country as keyof typeof eras]?.find((e) => e.era === filters.era));
	let landmarkPreviews = $state<App.Media.Metadata[]>([]);

	// Handlers
	const handleClickMarker = (point: App.Media.Metadata) => {
		// Move landmark into view (but slightly above center for menu)
		map.easeTo({
			center: [point.longitude, point.latitude],
			padding: { top: 0, bottom: 300, left: 0, right: 0 }
		});
		// Select landmark and pull up menu
		handleSelectLandmark({ filename: point.filename });
		handleShowMenu(true);
		// Add pin to show current-clicked location
		mapClickMarker?.remove(); // Remove previous click marker
		mapClickMarker = new mapboxgl.Marker({
			color: 'red',
			className: 'z-10',
			offset: [offset[point.filename][0], offset[point.filename][1] - 10]!
		})
			.setLngLat([point.longitude, point.latitude])
			.addTo(map);
	};
	const handleFilterEra = (era?: string) => {
		filters.era = era;
		renderLandmarks(); // Filter map markers
		landmarkPreviews = [...manifest] // Filter previews in menu bar
			.sort((a, b) => a.year - b.year)
			.filter((point) =>
				filters.era ? getEra(point.year, point.country).era === filters.era : point.hasAnimation
			)
			.slice(0, 9);
		handleSelectLandmark(selectedLandmark); // Reset current landmark to show suggestions in the menu bar
		// Remove previous click marker
		mapClickMarker?.remove();
	};

	// Rendering and filtering
	const renderLandmarks = () => {
		// Reset markers
		mapMarkers.forEach((marker) => marker.remove());
		mapMarkers = [];
		// Draw all points to render
		const filteredPoints = filters.era
			? manifest.filter((point) => getEra(point.year, point.country).era === filters.era)
			: manifest;
		const jitteredPoints = applyOverlappingMarkerJitter(filteredPoints);
		for (const point of jitteredPoints) {
			offset[point.point.filename] = point.offset;
			const marker = createLandmark(point, handleClickMarker);
			mapMarkers.push(marker);
			marker.addTo(map);
		}
	};

	// Draw map
	onMount(() => {
		// Initialize the map
		map = new mapboxgl.Map({
			container,
			accessToken: CONFIG.MAPBOX_PUBLIC_TOKEN,
			center: country === 'Gibraltar' ? GIBRALTAR_COORDS : [0, 0],
			zoom: CONFIG.DEFAULT_ZOOM // Default zoom
		});

		// Render map and menu assets
		renderLandmarks(); // Add markers and pop-up labels
		handleFilterEra(era?.era); // Show featured previews on first load

		// Zoom, rotate and compass controls
		navControls = new mapboxgl.NavigationControl({});
		// map.addControl(navControls, 'right');

		// Locate user button
		locationControls = new mapboxgl.GeolocateControl({
			positionOptions: {
				enableHighAccuracy: true
			},
			trackUserLocation: true,
			showUserHeading: true
		});
		map.addControl(locationControls, 'right');

		// Resize on change
		const resizeObserver = new ResizeObserver(() => map?.resize());
		resizeObserver.observe(container);

		// Cleanup on exit
		return () => {
			map.remove();
			resizeObserver.disconnect();
		};
	});
</script>

<div
	class="fixed top-0 right-0 box-border h-full w-full overflow-hidden rounded-none border-2 border-hidden border-white transition-all"
>
	<!-- Map -->
	<div bind:this={container} class="h-full w-full"></div>
	<!-- Top menu -->
	<!-- Icon -->
	<img src="/svg/logo-gibraltar-xs.svg" class="fixed top-2 left-2 h-8 w-auto" alt="Logo" />
	<!-- Filter -->
	<div class="fixed top-2 left-18 z-20">
		<EraSelection {country} selected={filters.era} {handleFilterEra} />
	</div>

	<!-- Bottom menu -->
	<MenuBar
		landmarks={landmarkPreviews}
		{selectedLandmark}
		{handleShowMenu}
		{showMenu}
		{handleClickMarker}
		{handleSelectView}
		{era}
	/>
</div>

<style>
	/* Small mapbox labels */
	:global(.mapboxgl-popup-content) {
		padding: 0px 3px;
	}
</style>
