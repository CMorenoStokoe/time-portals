<script lang="ts">
	let beta = $state(0);
	let gamma = $state(0);

	function handleOrientation(event: DeviceOrientationEvent) {
		// Beta is front-to-back motion (-180 to 180) - for vertical pan
		// Gamma is left-to-right motion (-90 to 90) - for horizontal pan
		// We'll cap the values to create a limited panning area.
		beta = Math.max(-90, Math.min(90, event.beta || 0));
		gamma = Math.max(-90, Math.min(90, event.gamma || 0));
	}

	// Mock for desktop using mouse position
	function handleMouseMove(event: MouseEvent) {
		const { clientX, clientY } = event;
		const { innerWidth, innerHeight } = window;

		// Map mouse X position to gamma (left/right tilt, -90 to 90)
		gamma = (clientX / innerWidth) * 180 - 90;
		// Map mouse Y position to beta (front/back tilt, -90 to 90)
		beta = (clientY / innerHeight) * 180 - 90;
	}

	// Pan sensitivity factor
	const panFactor = 0.3;

	// Use derived state for transformations.
	// Inverting one axis might be necessary depending on desired feel.
	const x = $derived(gamma * panFactor);
	const y = $derived(beta * panFactor);
	const transform = $derived(`translate(${x}px, ${y}px)`);
</script>

<svelte:window on:deviceorientation={handleOrientation} on:mousemove={handleMouseMove} />

<img src="/locations/london-bridge/medieval.png" alt="Medieval London Bridge" style:transform />

<style>
	:global(body, html) {
		overflow: hidden;
		width: 100%;
		height: 100%;
	}

	img {
		position: fixed;
		/* Make the image larger to create panning room */
		width: 120vw;
		height: 120vh;
		/* Center the oversized image */
		left: -10vw;
		top: -10vh;

		object-fit: cover;
		/* Add a smooth transition for the pan effect */
		transition: transform 0.2s ease-out;
		will-change: transform;
	}
</style>
