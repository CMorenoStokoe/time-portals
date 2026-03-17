<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	export let data;

	// Parsed location name
	const location = $page.url.pathname
		.split('/')
		.filter((loc) => loc && loc !== 'portals')
		.reverse()
		.map((loc) => (loc.charAt(0).toUpperCase() + loc.slice(1)).replace(/-/g, ' '));

	// Control bar
	let showControls = false;

	// Video pan controls
	let enablePan = true; // Whether to allow panning the video based on device orientation (gyroscope) input
	const PAN_SCALE = 1.2; // How much to scale the video to allow for panning without showing black bars
	let panX = 0; // -x/2% - x/2% Pan left/right scene
	let panY = 0; // -y/2% - x/y% Pan up/down scene
	let rotate = 0; // landscape/portrait orientation (-90 - 90 degrees)
	let gyroLastSeenAt = 0;
	let gyroLastAlpha = 0; // Last raw compass reading, used to calculate deltas for smooth panning

	// Debug
	let enableDebug = false;
	$: debug = {} as Record<string, any>; // Reactive debug info object to display gyroscope data and calculations

	// Handle gyroscope input (if permission granted)
	function ondeviceorientation(event: DeviceOrientationEvent) {
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
			debug = {
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

	// Show fading location text
	$: showDatePreview = false;
	onMount(() => {
		showDatePreview = true;
		const timeout = setTimeout(() => {
			showDatePreview = false;
		}, 5000);
		return () => clearTimeout(timeout);
	});
</script>

<svelte:window {ondeviceorientation} />

<!-- Date preview -->
{#if showDatePreview}
	<div
		class="absolute top-1/3 z-10 flex w-full flex-col items-center justify-center gap-2 text-black text-shadow-blue-300/10 text-shadow-lg"
		transition:fade={{ delay: 500, duration: 2000 }}
	>
		<p class=" font-display text-7xl font-bold">
			- {data.year} -
		</p>
		<p class="text-4xl">
			{location[0]},
		</p>
		<p class="text-2xl">
			{location[1]}
		</p>
	</div>
{/if}

<!-- Controls -->
<div class="absolute top-2 right-2 z-10 m-2 flex flex-row gap-2 transition-all">
	<!-- Logo watermark -->
	<h2 class="font-display text-3xl opacity-25">Time Portals</h2>

	{#if showControls}
		<div class="flex flex-row gap-2 transition-all" transition:slide={{ axis: 'x' }}>
			<!-- Pan button -->
			<button
				class="h-full rounded bg-white p-1 px-2 font-bold text-nowrap transition-all {enablePan
					? '  opacity-75'
					: ' line-through opacity-25'}"
				on:click={() => (enablePan = !enablePan)}
			>
				Gyro 🧭
			</button>
			<!-- Debug mode -->
			<button
				class="h-full rounded bg-white p-1 px-2 font-mono font-bold text-nowrap transition-all {enableDebug
					? '  opacity-75'
					: ' line-through opacity-25'}"
				on:click={() => (enableDebug = !enableDebug)}
			>
				Developer Mode
			</button>
		</div>
	{/if}
	<!-- Show/hide controls -->
	<button
		class="rounded-xl p-1 px-2 font-bold transition-all {showControls
			? 'rotate-90 opacity-100'
			: 'opacity-50'}"
		on:click={() => (showControls = !showControls)}
	>
		<img src="/svg/icons/settings.svg" alt="Toggle controls" class="h-8 w-8" />
	</button>
</div>

<!-- Portal view -->
<div
	class="flex h-full max-h-full w-full max-w-full flex-row items-center justify-center overflow-hidden"
>
	<!-- Content -->
	{#if data.type === 'video'}
		<video
			in:fade
			class="h-full w-full object-cover"
			style="transform: translate3d({panX}%, {panY}%, 0) rotate({rotate}deg) scale({PAN_SCALE}); transition: transform 120ms linear;"
			controls={null}
			preload="metadata"
			autoplay
			loop
			muted
		>
			<source src="?raw=true" type="video/mp4" />
		</video>
	{:else}
		<img
			in:fade
			src="?raw=true"
			alt={data.year}
			class="h-full w-full object-cover"
			style="transform: translate3d({panX}%, {panY}%, 0) rotate({rotate}deg) scale({PAN_SCALE}); transition: transform 120ms linear;"
		/>
	{/if}
</div>

<!-- Debug overview -->
{#if enableDebug}
	<div
		class="absolute right-2 bottom-2 z-50 flex flex-col items-center justify-center gap-2 bg-black/25 text-center font-mono text-white"
	>
		<p>Raw (gamma): {debug?.gamma}°</p>
		<div
			class="h-8 w-4 rounded bg-white/50"
			style="transform: rotate({debug?.gamma ?? 0}deg);"
		></div>

		<p>Final (rotate): {debug?.rotate}°</p>
		<div class="h-8 w-4 rounded bg-white/50" style="transform: rotate({rotate}deg);"></div>

		<p>
			{#each Object.entries(debug || {}) as [key, value] (key)}
				{key}: {value}
				<br />
			{/each}
		</p>
	</div>
{/if}
