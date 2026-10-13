import mapboxgl from 'mapbox-gl';
import { LandmarkPin } from './LandmarkPin';

// Mount landmark marker to map
export const createLandmark = (
	{
		point,
		offset
	}: { point: App.Media.Metadata; offset: [number, number]; isOverlapping: boolean },
	handleClickMarker: (landmark: App.Media.Metadata) => void
) => {
	const marker = new mapboxgl.Marker({
		color: point.hasAnimation ? 'red' : 'coral',
		className: point.hasAnimation
			? 'landmark-marker-animated z-[2] cursor-pointer'
			: 'landmark-marker z-0 cursor-pointer',
		element: LandmarkPin(point, handleClickMarker),
		offset: offset ?? [0, 0] // Jitter
	}).setLngLat([point.longitude, point.latitude]);

	// Slightly higher z-index to overlay other markers only (stays below bottom drawer z-10)
	marker.getElement().style.zIndex = point.hasAnimation ? '2' : '0';

	return marker;
};
