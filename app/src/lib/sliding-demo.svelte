<script lang="ts">
	let overlayPosition = $state(50);
	function handleSlider(event: Event) {
		overlayPosition = (event.target as HTMLInputElement).valueAsNumber;
	}
</script>

<div class="relative mx-auto h-40 w-full max-w-96 overflow-hidden rounded-xl border-4">
	<!-- Labels -->
	<p class="absolute top-0 left-0 z-10 rounded-br-xl bg-white px-2 text-black">Present day</p>
	<p class="absolute top-0 right-0 z-10 rounded-bl-xl bg-white px-2 text-black">1779</p>

	<!-- Historic overlay -->
	<div class="absolute inset-0 w-full overflow-hidden">
		<img src="/demo/gib-1779.png" class="h-full w-full object-cover" alt="1778" />
	</div>

	<!-- Modern base -->
	<div
		class="absolute inset-0 overflow-hidden"
		style={`clip-path: inset(0 ${100 - overlayPosition}% 0 0);`}
	>
		<img src="/demo/gib-2026.png" class="h-full w-full object-cover" alt="2026" />
	</div>

	<!-- Slider -->
	<input
		type="range"
		min="0"
		max="100"
		bind:value={overlayPosition}
		oninput={handleSlider}
		class="slider-hitbox absolute inset-0 m-0 h-full w-full cursor-ew-resize appearance-none bg-transparent
               [&::-moz-range-thumb]:h-full [&::-moz-range-thumb]:w-8
               [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-transparent
               [&::-webkit-slider-thumb]:h-full [&::-webkit-slider-thumb]:w-8
               [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-transparent"
	/>
	<div
		class="-translate-x pointer-events-none absolute inset-y-0 w-2 bg-white pl-1"
		style="left: {overlayPosition}%;"
	>
		<div
			class="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90 rounded-full bg-white p-1 pb-0 text-black shadow-md"
		>
			<icon class="icon">swipe_vertical</icon>
		</div>
	</div>
</div>

<style>
	.slider-hitbox::-webkit-slider-runnable-track {
		width: 100%;
		height: 100%;
		background: transparent;
	}

	.slider-hitbox::-moz-range-track {
		width: 100%;
		height: 100%;
		background: transparent;
		border: 0;
	}
</style>
