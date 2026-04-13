<script lang="ts">
	let overlayPosition = $state(50);
	function handleSlider(event: Event) {
		overlayPosition = (event.target as HTMLInputElement).valueAsNumber;
	}
</script>

<div class="relative mx-auto h-40 w-96 max-w-full overflow-hidden rounded-xl border-4 px-2">
	<!-- Historic overlay -->
	<div class="absolute inset-0 w-full overflow-hidden">
		<img src="demo/gib-1779.png" class="h-40 w-96 object-cover" alt="1778" />
	</div>

	<!-- Modern base -->
	<div class="absolute inset-0 overflow-hidden" style="width: {overlayPosition}%;">
		<img src="demo/gib-2026.png" class="h-40 w-96 min-w-96 object-cover" alt="2026" />
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
		class="-translate-x pointer-events-none absolute inset-y-0 w-2 bg-white pl-1"
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
				class="h-6 w-6 text-black"
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
