<script lang="ts">
	import { onMount } from 'svelte';
	import mapboxgl from 'mapbox-gl';
	import 'mapbox-gl/dist/mapbox-gl.css';
	import { manifest } from '$lib/utilities/useMinifiedManifest';

	let { onClickLandmark } = $props();

	let container: HTMLDivElement;

	onMount(() => {
		const coordinateCounts = new Map<string, number>();
		const labels: mapboxgl.Popup[] = [];

		// Initialize the map
		const map = new mapboxgl.Map({
			container,
			accessToken:
				'pk.eyJ1IjoiY21vcmVub3N0b2tvZSIsImEiOiJjbXMzaWowZjMwbWp3MnhzYTU4bDJ1ejdkIn0.cXpD4j1NwMtEDR1MfHVyPw',
			style: 'mapbox://styles/mapbox/streets-v12',
			center: [-5.3538, 36.1415],
			zoom: 14
		});

		// Add markers and popups for each point in the manifest
		const sortedPoints = [...manifest].sort(
			(a, b) => Number(a.hasAnimation) - Number(b.hasAnimation)
		);

		for (const point of sortedPoints) {
			// Apply jitter
			const key = `${point.longitude},${point.latitude}`;
			const overlapIndex = coordinateCounts.get(key) ?? 0;
			coordinateCounts.set(key, overlapIndex + 1);

			const angle = overlapIndex * 2.4;
			const radius = overlapIndex === 0 ? 0 : 14;

			const offset: [number, number] = [Math.cos(angle) * radius * 2, Math.sin(angle) * radius * 2];

			// Create a popup for the marker
			const popup = new mapboxgl.Popup({
				closeButton: false,
				closeOnClick: false,
				offset,
				className: 'z-30'
			}).setHTML(`
				<p class="font-greek text-lg font-bold">
					${point.year}
					<span class="ml-auto font-body text-xs text-red-500">
						${point.hasAnimation ? 'Animated' : ''}
					</span>
				</p>
				<strong class="font-display">${point.location}</strong>
			`);

			// Create a permanent label shown when zoomed in closely
			const label = new mapboxgl.Popup({
				closeButton: false,
				closeOnClick: false,
				offset: [offset[0], offset[1] - 24],
				className: 'landmark-label pointer-events-none z-20'
			})
				.setLngLat([point.longitude, point.latitude])
				.setHTML(
					`<span class="font-display text-xs font-bold">${point.location.length > 29 ? point.location.slice(0, 30) + '...' : point.location}</span>`
				);
			if (overlapIndex === 0) labels.push(label); // Only add the label for the first marker at this coordinate to avoid duplicates

			// Create the marker
			const marker = new mapboxgl.Marker({
				color: point.hasAnimation ? 'red' : 'coral',
				offset
			})
				.setLngLat([point.longitude, point.latitude])
				.addTo(map);

			const element = marker.getElement();

			// Prioritise showing animated landmarks on top of static ones
			const defaultZIndex = point.hasAnimation ? '10' : '1';
			element.style.zIndex = defaultZIndex;

			// Add event listeners for hover and click
			element.addEventListener('mouseenter', () => {
				element.style.zIndex = '20';
				popup.setLngLat([point.longitude, point.latitude]).addTo(map);
			});

			element.addEventListener('mouseleave', () => {
				element.style.zIndex = defaultZIndex;
				popup.remove();
			});

			element.addEventListener('click', () => {
				onClickLandmark({ filename: point.filename });
			});
		}

		// Show landmark names when zoomed in closely
		const updateLabels = () => {
			const showLabels = map.getZoom() >= 16;

			for (const label of labels) {
				if (showLabels && !label.isOpen()) {
					label.addTo(map);
				} else if (!showLabels) {
					label.remove();
				}
			}
		};

		map.on('zoom', updateLabels);
		updateLabels();

		// Zoom, rotate and compass controls
		map.addControl(
			new mapboxgl.NavigationControl({
				showZoom: true,
				showCompass: true,
				visualizePitch: true
			}),
			'right'
		);

		// Locate user button
		map.addControl(
			new mapboxgl.GeolocateControl({
				positionOptions: {
					enableHighAccuracy: true
				},
				trackUserLocation: true,
				showUserHeading: true
			}),
			'right'
		);

		return () => {
			map.off('zoom', updateLabels);
			map.remove();
		};
	});
</script>

<div bind:this={container} class="h-full w-full"></div>

<style>
	:global(.landmark-label .mapboxgl-popup-content) {
		padding: 2px 5px;
		white-space: nowrap;
	}

	:global(.landmark-label .mapboxgl-popup-tip) {
		display: none;
	}
</style>
