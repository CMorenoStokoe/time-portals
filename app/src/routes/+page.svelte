<script lang="ts">
	import SlidingDemo from '$lib/sliding-demo.svelte';
</script>

<main
	class="flex min-h-full w-full flex-col items-center justify-center space-y-2 overflow-y-auto font-body text-orange-50"
>
	<!-- Logo -->
	<img src="svg/logo.svg" alt="History Lens" class="mb-12 max-h-96 w-auto max-w-full" />

	<!-- Intro -->
	<h1 class="font-display text-xl font-black">View historic sites at their prime.</h1>
	<p class="text-xs italic">Slide the bar to preview one of our historic sites</p>
	<SlidingDemo />

	<!-- Instructions -->
	<h1 class="mt-4 font-display">Step 1</h1>
	<p class="text-xs">Find a QR code at a landmark</p>
	<img
		src="instructions/QR-step-1.png"
		class="h-60 w-60 rounded-xl border-4 border-orange-800"
		alt="step 1"
	/>
	<h1 class="mt-4 font-display">Step 2</h1>
	<p class="text-xs">Scan the QR code with your phone</p>
	<img
		src="instructions/QR-step-2.png"
		class="h-60 w-60 rounded-xl border-4 border-orange-800"
		alt="step 1"
	/>
	<h1 class="mt-4 font-display">Step 3</h1>
	<p class="text-center text-xs">
		View a carefully curated view of the historic site during a significant event
	</p>
	<img
		src="instructions/QR-step-3.png"
		class="mb-12 h-60 w-60 rounded-xl border-4 border-orange-800"
		alt="step 3"
	/>
</main>
