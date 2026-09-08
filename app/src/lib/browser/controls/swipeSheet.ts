export interface SwipeSheetOptions {
	peekHeight?: number; // Collapsed height in px (default: 160)
	expandedHeight?: number; // Expanded height in vh (default: 75)
	threshold?: number; // Minimum drag delta px to trigger snap (default: 50)
	velocityThreshold?: number; // Flick velocity threshold (default: 0.5)
	initialExpanded?: boolean;
	onToggle?: (expanded: boolean) => void;
}

export function swipeSheet(node: HTMLElement, options: SwipeSheetOptions = {}) {
	let peekHeight = options.peekHeight ?? 160;
	let expandedHeight = options.expandedHeight ?? 60;
	let threshold = options.threshold ?? 50;
	let velocityThreshold = options.velocityThreshold ?? 0.5;
	let isExpanded = options.initialExpanded ?? false;

	let isDragging = false;
	let startY = 0;
	let currentDeltaY = 0;
	let lastY = 0;
	let lastTime = 0;
	let velocityY = 0;
	let hasDragged = false;
	let suppressClick = false;

	// Apply base styles
	node.style.setProperty('--sheet-peek', `${peekHeight}px`);
	node.style.setProperty('--sheet-expanded', `${expandedHeight}vh`);
	node.style.setProperty('--sheet-offset', '0px');
	applyStateStyle(isExpanded, false);

	const handle = (node.querySelector('[data-drag-handle]') as HTMLElement) || node;
	handle.style.touchAction = 'none';

	function applyStateStyle(expanded: boolean, dragging: boolean) {
		node.style.height = expanded ? `var(--sheet-expanded)` : `var(--sheet-peek)`;
		node.style.transition = dragging ? 'none' : 'height 0.35s cubic-bezier(0.2, 0.9, 0.3, 1)';
		node.style.transform = 'translateY(0px)';
	}

	function onPointerDown(e: PointerEvent) {
		isDragging = true;
		startY = e.clientY;
		lastY = e.clientY;
		lastTime = performance.now();
		currentDeltaY = 0;
		velocityY = 0;
		hasDragged = false;

		handle.setPointerCapture(e.pointerId);
		applyStateStyle(isExpanded, true);
	}

	function onPointerMove(e: PointerEvent) {
		if (!isDragging) return;

		const now = performance.now();
		const dt = now - lastTime;
		if (dt > 0) {
			velocityY = (e.clientY - lastY) / dt; // px/ms
		}
		lastY = e.clientY;
		lastTime = now;

		const delta = e.clientY - startY;
		hasDragged = hasDragged || Math.abs(delta) > 5;

		// Constrain direction: resist pulling down when closed, or up when open
		if (isExpanded) {
			currentDeltaY = Math.max(0, delta);
		} else {
			currentDeltaY = Math.min(0, delta);
		}

		const baseHeight = isExpanded ? 'var(--sheet-expanded)' : 'var(--sheet-peek)';
		node.style.height = `clamp(var(--sheet-peek), calc(${baseHeight} - ${currentDeltaY}px), var(--sheet-expanded))`;
	}

	function onPointerUp(e: PointerEvent) {
		if (!isDragging) return;
		isDragging = false;
		suppressClick = hasDragged;

		if (handle.hasPointerCapture(e.pointerId)) {
			handle.releasePointerCapture(e.pointerId);
		}

		// Snap logic: Check flick velocity first, fallback to positional threshold
		const swipedUp = velocityY < -velocityThreshold || currentDeltaY < -threshold;
		const swipedDown = velocityY > velocityThreshold || currentDeltaY > threshold;

		if (!isExpanded && swipedUp) {
			isExpanded = true;
			options.onToggle?.(true);
		} else if (isExpanded && swipedDown) {
			isExpanded = false;
			options.onToggle?.(false);
		}

		node.style.setProperty('--sheet-offset', '0px');
		applyStateStyle(isExpanded, false);
	}

	function onClickCapture(e: MouseEvent) {
		if (!suppressClick) return;

		e.preventDefault();
		e.stopImmediatePropagation();
		suppressClick = false;
	}

	handle.addEventListener('pointerdown', onPointerDown);
	handle.addEventListener('pointermove', onPointerMove);
	handle.addEventListener('pointerup', onPointerUp);
	handle.addEventListener('pointercancel', onPointerUp);
	handle.addEventListener('click', onClickCapture, true);

	return {
		update(newOptions: SwipeSheetOptions) {
			peekHeight = newOptions.peekHeight ?? 160;
			expandedHeight = newOptions.expandedHeight ?? 60;
			threshold = newOptions.threshold ?? 50;
			velocityThreshold = newOptions.velocityThreshold ?? 0.5;

			node.style.setProperty('--sheet-peek', `${peekHeight}px`);
			node.style.setProperty('--sheet-expanded', `${expandedHeight}vh`);

			if (newOptions.initialExpanded !== undefined && newOptions.initialExpanded !== isExpanded) {
				isExpanded = newOptions.initialExpanded;
				applyStateStyle(isExpanded, false);
			}
		},
		destroy() {
			handle.removeEventListener('pointerdown', onPointerDown);
			handle.removeEventListener('pointermove', onPointerMove);
			handle.removeEventListener('pointerup', onPointerUp);
			handle.removeEventListener('pointercancel', onPointerUp);
			handle.removeEventListener('click', onClickCapture, true);
		}
	};
}
