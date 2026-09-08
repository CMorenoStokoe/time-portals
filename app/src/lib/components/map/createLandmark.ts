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
		className: 'opacity-0 transition-all' + (point.hasAnimation === true ? 'animate-pulse' : 'z-0'),
		element: LandmarkPin(point, handleClickMarker),
		offset: offset ?? [0, 0] // Jitter
	}).setLngLat([point.longitude, point.latitude]);

	return marker;
};
