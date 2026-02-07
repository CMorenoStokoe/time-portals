<script lang="ts">
	import { fade } from 'svelte/transition';

	let overlayPosition = $state(50);
	let demoMediaClicked = $state(false);

	function handleSlider(event: Event) {
		overlayPosition = (event.target as HTMLInputElement).valueAsNumber;
	}
</script>

<h1 class="text-xl">Interactive demo</h1>
<p class="font-bold">London Bridge</p>
<em class="text-xs">Move the slider to compare a layover of medieval London over modern London.</em>

<div class="relative h-40 w-96 overflow-hidden rounded-xl border-4">
	<!-- Historic overlay -->
	<div class="absolute inset-0 w-full overflow-hidden">
		<video src="demo/historic.mp4" autoplay loop muted class="h-40 w-96 object-cover"></video>
	</div>

	<!-- Modern base -->
	<div class="absolute inset-0 overflow-hidden" style="width: {overlayPosition}%;">
		<video src="demo/modern.mp4" autoplay loop muted class="h-40 w-96 min-w-96 object-cover"
		></video>
	</div>

	<!-- Slider -->

	<input
		type="range"
		min="0"
		max="100"
		bind:value={overlayPosition}
		oninput={handleSlider}
		class="absolute h-full w-full cursor-ew-resize appearance-none bg-transparent
               [&::-moz-range-thumb]:h-screen [&::-moz-range-thumb]:w-8
               [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-transparent
               [&::-webkit-slider-thumb]:h-screen [&::-webkit-slider-thumb]:w-8
               [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-transparent"
	/>

	<div
		class="pointer-events-none absolute inset-y-0 z-0 w-0.5 -translate-x-1/2 bg-white"
		style="left: {overlayPosition}%;"
	>
		<div
			class="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white p-1.5 shadow-md"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="h-4 w-4 text-black"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M10.5 19.5 3 12l7.5-7.5m3 15L21 12l-7.5-7.5"
				/>
			</svg>
		</div>
	</div>
</div>

<h1 class="text-xl">Standing demo</h1>
<p class="font-bold">London Bridge</p>
<em class="text-xs"
	>Click the image to preview what you would see if you opened the app at this location and pointed
	your phone at London Bridge.</em
>
<button
	onclick={() => (demoMediaClicked = !demoMediaClicked)}
	class="relative block h-40 w-96 overflow-hidden rounded-xl border-4"
>
	<video
		src="demo/static-historic.mp4"
		autoplay
		loop
		muted
		class="absolute top-0 h-full w-full object-cover"
	></video>

	{#if !demoMediaClicked}
		<img
			out:fade
			src="demo/static-modern.png"
			alt="Standing demo preview"
			class="absolute top-0 h-full w-full object-cover"
		/>
	{/if}
</button>
