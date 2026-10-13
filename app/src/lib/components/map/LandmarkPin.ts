import { getEra } from '$lib/data/eras';

// Constructs a custom landmark element for the map
export const LandmarkPin = (
	landmark: App.Media.Metadata,
	handleClickMarker: (landmark: App.Media.Metadata) => void
) => {
	// Outer container
	const wrapper = document.createElement('div');
	wrapper.className = 'relative flex items-center justify-center cursor-pointer';

	if (landmark.hasAnimation) {
		// Rotating broken red border like a spinner
		const spinner = document.createElement('div');
		spinner.className =
			'pointer-events-none absolute -inset-[2px] rounded-full border-2 border-dashed border-red-500 animate-spin';
		spinner.style.animation = 'spin 6s linear infinite';
		wrapper.appendChild(spinner);
	}

	// Inner pin with background & era filter
	const pinContainer = document.createElement('div');
	pinContainer.className =
		'flex flex-col items-center justify-center w-6 h-6 p-px border border-white rounded-full bg-red-500/90 shadow-sm';

	// Get era
	const { icon, historicalness } = getEra(landmark.year, landmark.country);
	pinContainer.style.filter = `${historicalness > 50 ? 'grayscale' : 'sepia'}(${historicalness}%)`;

	// Landmark icon
	const pin = document.createElement('img');
	pin.setAttribute('src', icon);
	pin.setAttribute('alt', landmark.location);
	pin.className = 'w-full h-full object-contain';
	pinContainer.appendChild(pin);

	wrapper.appendChild(pinContainer);

	// On click functionality
	wrapper.addEventListener('click', () => handleClickMarker(landmark));

	return wrapper;
};
