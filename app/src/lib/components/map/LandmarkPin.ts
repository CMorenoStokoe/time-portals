import { getEra } from '$lib/data/eras';

// Constructs a custom landmark ele element for the map
export const LandmarkPin = (
	landmark: App.Media.Metadata,
	handleClickMarker: (landmark: App.Media.Metadata) => void
) => {
	// Wrapper with background
	const div = document.createElement('div');
	div.className =
		'flex flex-col items-center justify-center w-6 h-6 p-px border border-white rounded-full bg-red-500/90';
	// + 'opacity-0 transition-all'; // Opacity for later transitioning in

	// Get era
	const { icon, historicalness } = getEra(landmark.year, landmark.country);
	div.style.filter = `${historicalness > 50 ? 'grayscale' : 'sepia'}(${historicalness}%)`;

	// Landmark icon
	const pin = document.createElement('img');
	pin.setAttribute('src', icon);
	// icon.className = `text-lg text-white`;
	// icon.style = `${landmark.hasAnimation ? 'animation: colorCycle 2s ease-in-out infinite;' : ''}`;
	div.appendChild(pin);

	// On click functionality
	div.addEventListener('click', () => handleClickMarker(landmark));

	return div;
};
