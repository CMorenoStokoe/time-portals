<script lang="ts">
	import { onMount } from 'svelte';
	import mapboxgl from 'mapbox-gl';
	import 'mapbox-gl/dist/mapbox-gl.css';
	import { manifest } from '$lib/data/manifest';

	let { onClickLandmark } = $props();

	let container: HTMLDivElement;

	onMount(() => {
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
		for (const point of manifest) {
			const popup = new mapboxgl.Popup({
				closeButton: false,
				closeOnClick: false,
				offset: 25
			}).setHTML(`
				<p class='font-greek font-bold text-lg'>${point.year} <span class='text-xs ml-auto font-body text-red-500'>${point.hasAnimation ? 'Animated' : ''}<span></p>
				<strong class='font-display'>${point.location}</strong><br>
				`);

			const marker = new mapboxgl.Marker({
				color: point.hasAnimation ? 'red' : 'coral'
			})
				.setLngLat([point.longitude, point.latitude])
				.addTo(map);

			const element = marker.getElement();

			element.addEventListener('mouseenter', () => {
				popup.setLngLat([point.longitude, point.latitude]).addTo(map);
			});

			element.addEventListener('mouseleave', () => {
				popup.remove();
			});

			element.addEventListener('click', () => {
				onClickLandmark({
					latitude: point.latitude,
					longitude: point.longitude
				});
			});
		}

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

		return () => map.remove();
	});
</script>

<div bind:this={container} class="h-full w-full"></div>
