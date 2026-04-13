// Gyro control variables (temporary)
export const gyroControls = {
	// Controls
	enablePan: false, // Whether to allow panning the video based on device orientation (gyroscope) input
	PAN_SCALE: 1.2, // How much to scale the video to allow for panning without showing black bars
	panX: 0, // -x/2% - x/2% Pan left/right scene
	panY: 0, // -y/2% - x/y% Pan up/down scene
	rotate: 0, // landscape/portrait orientation (-90 - 90 degrees)
	gyroLastSeenAt: 0,
	gyroLastAlpha: 0, // Last raw compass reading, used to calculate deltas for smooth panning

	// Debug
	enableDebug: false,
	debug: {} as Record<string, string | number | null | undefined> // Reactive debug info object to display gyroscope data and calculations
};

/**
 * # Gyro controls
 * @description Handles gyroscope input
 * @example Implementation
 * style="transform: translate3d({panX}%, {panY}%, 0) rotate({rotate}deg) scale({PAN_SCALE}); transition: transform 120ms linear;"
 * @requires Permissions (see below)
 * @link [MDN DeviceOrientationEvent](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent)
 */
export function onDeviceOrientation(event: DeviceOrientationEvent, states: typeof gyroControls) {
	const { enablePan, PAN_SCALE, enableDebug } = states;
	let { panX, panY, rotate, gyroLastSeenAt, gyroLastAlpha } = states;
	if (
		!enablePan ||
		event.gamma == null ||
		event.beta == null ||
		event.alpha == null ||
		Date.now() - gyroLastSeenAt < 5
	)
		return; // Validate and rate limit input
	else gyroLastSeenAt = Date.now();

	// Extract 3D orientation angles of the device
	const {
		alpha, // Users compass facing (z-axis,  to 360 degrees)
		beta, // Users facing up towards the sky or down towards the group (x-axis, -180 to 180)
		gamma // Users rotating the phone portrait/landscape (y-axis, -90 to 90 degrees)
	} = event;

	// Rotate video appropriately
	if (Math.abs(gamma) > 35)
		// Dead-zone
		rotate = -gamma / 5; // Sensitivity
	else if (Math.abs(beta) > 15)
		rotate = beta / 15; // Dead-zone smoothing
	else rotate = 0; // Reset within dead-zone

	// Pan the video in the opposite direction to create a parallax effect
	const maxPanPct = (PAN_SCALE - 1) * 50; // Max pan in either direction before showing black bars (as a percentage)
	const alphaAsPct = ((alpha % 360) - 180) / 180; // Convert compass angle to a percentage from -1 to 1, where 0 is facing "forward"
	const alphaDeltaAsPct = (gyroLastAlpha - alpha) / 180; // Change in compass angle since last event, as a percentage
	const betaAsPct = (beta / 90) * 10; // Convert beta angle to a percentage from -1 to 1, where 0 is facing "forward"
	panX = Math.max(-maxPanPct, Math.min(maxPanPct, panX - alphaDeltaAsPct)); // Pan left/right based on compass changes, clamped to prevent excessive panning
	panY = Math.max(-maxPanPct, Math.min(maxPanPct, betaAsPct)); // Subtract 90 to make panning more intuitive (phone facing straight forward is the "center" with no pan)

	// Smoothly reset pan when user changes compass direction by calculating deltas
	gyroLastAlpha = alpha;

	// Update debug info
	if (enableDebug)
		gyroControls.debug = {
			alpha: alpha.toFixed(2),
			beta: beta.toFixed(2),
			gamma: gamma.toFixed(2),
			panX: panX.toFixed(2),
			panY: panY.toFixed(2),
			rotate: rotate.toFixed(2),
			maxPanPct: maxPanPct.toFixed(2),
			alphaAsPct: alphaAsPct.toFixed(2),
			alphaDeltaAsPct: alphaDeltaAsPct.toFixed(2),
			betaAsPct: betaAsPct.toFixed(2)
		};
}
