<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import SlidingDemo from '$lib/sliding-demo.svelte';
</script>

<main
	class="flex min-h-full w-full flex-col items-center justify-center space-y-2 pb-16 text-center font-body text-orange-50"
>
	<!-- Logo -->
	<img src="svg/logo.svg" alt="History Lens" class="mb-12 max-h-80 w-auto max-w-full" />

	<!-- Intro -->
	<h1 class="font-display text-2xl font-black">View historic sites at their prime.</h1>
	<p class="text-xs italic">Slide the bar to preview one of our historic sites</p>
	<SlidingDemo />
	<button
		class="cursor-pointer rounded bg-orange-800 p-2 font-display text-white hover:scale-105 hover:bg-orange-700"
		onclick={() => goto(resolve('/go/gibraltar/pillars-of-hercules'))}>Visit live preview</button
	>
	<hr class="border-px mt-6 w-full border-orange-200/25" />

	<!-- Instructions -->
	<h1 class="mt-4 font-display text-2xl font-black">How it works</h1>

	<h1 class="font-display">Step 1</h1>
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
		class="mb-6 h-60 w-60 rounded-xl border-4 border-orange-800"
		alt="step 3"
	/>
	<hr class="border-px mb-6 w-full border-orange-200/25" />

	<!-- Demo -->
	<h1 class="font-display text-2xl font-black">Demo</h1>
	<p class="text-center text-xs">
		Click here to view a demo of the Pillars of Hercules viewpoint (Gibraltar)
	</p>
	<button
		class="cursor-pointer rounded bg-orange-800 p-2 text-white hover:scale-105"
		onclick={() => goto(resolve('/go/gibraltar/pillars-of-hercules'))}>View a demo</button
	>
</main>
