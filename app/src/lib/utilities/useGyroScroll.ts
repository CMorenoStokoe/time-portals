const deadZone = 4;
const speedFactor = 0.8;
const smoothing = 0.15;

let targetVelocityX = 0;
let targetVelocityY = 0;
let currentVelocityX = 0;
let currentVelocityY = 0;
let isLoopRunning = false;
let scrollTarget: HTMLElement | null = null;

function updateScroll() {
	currentVelocityX += (targetVelocityX - currentVelocityX) * smoothing;
	currentVelocityY += (targetVelocityY - currentVelocityY) * smoothing;

	if (Math.abs(currentVelocityX) > 0.05 || Math.abs(currentVelocityY) > 0.05) {
		if (scrollTarget) {
			const maxX = Math.max(0, scrollTarget.scrollWidth - scrollTarget.clientWidth);
			const maxY = Math.max(0, scrollTarget.scrollHeight - scrollTarget.clientHeight);
			scrollTarget.scrollLeft = Math.max(
				0,
				Math.min(maxX, scrollTarget.scrollLeft + currentVelocityX)
			);
			scrollTarget.scrollTop = Math.max(
				0,
				Math.min(maxY, scrollTarget.scrollTop + currentVelocityY)
			);
		} else {
			window.scrollBy(currentVelocityX, currentVelocityY);
		}
	}

	requestAnimationFrame(updateScroll);
}

export async function requestGyroPermission() {
	if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) return true;
	const OrientationEvent = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
		requestPermission?: () => Promise<'granted' | 'denied'>;
	};
	if (!OrientationEvent.requestPermission) return true;
	const result = await OrientationEvent.requestPermission();
	return result === 'granted';
}

export function useGyroScroll(event: DeviceOrientationEvent, target?: HTMLElement | null) {
	if (target !== undefined) scrollTarget = target;
	if (event.beta == null || event.gamma == null) return;

	const baselineBeta = 45;
	const deltaY = event.beta - baselineBeta;
	const deltaX = event.gamma;

	targetVelocityY = Math.abs(deltaY) > deadZone ? deltaY * speedFactor : 0;
	targetVelocityX = Math.abs(deltaX) > deadZone ? deltaX * speedFactor : 0;

	if (!isLoopRunning) {
		isLoopRunning = true;
		requestAnimationFrame(updateScroll);
	}
}
