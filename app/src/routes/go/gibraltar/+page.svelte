<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import SlidingDemo from '$lib/sliding-demo.svelte';
</script>

<main
	class="flex min-h-full w-full flex-col items-center justify-center space-y-2 pb-16 text-center font-body text-red-50"
>
	<!-- Logo -->
	<img
		src="/svg/logo-themed-gibraltar.svg"
		alt="History Lens"
		class="mb-12 max-h-80 w-auto max-w-full"
	/>

	<!-- Intro -->
	<h1 class="font-display text-2xl font-black">Peek back in time</h1>
	<h1 class="font-display text-lg font-black">See historical Gibraltar</h1>
	<p class="text-xs italic">Slide the bar to preview the Great Siege of Gibraltar site</p>
	<SlidingDemo />
	<button
		class="cursor-pointer rounded bg-red-800 p-2 font-display text-white hover:scale-105 hover:bg-red-700"
		onclick={() => goto(resolve('/go/gibraltar/pillars-of-hercules'))}>Visit live preview</button
	>
	<hr class="border-px mt-6 w-full border-red-200/25" />

	<!-- Instructions -->
	<h1 class="mt-4 font-display text-2xl font-black">How it works</h1>

	<h1 class="font-display">Step 1</h1>
	<p class="text-xs">Hang a plaque by your business or organisation</p>
	<img src="/instructions/QR-plaque.svg" class="h-60 w-auto rounded-xl border-4" alt="step 1" />
	<h1 class="mt-4 font-display">Step 2</h1>
	<p class="text-xs">
		Increase your foot traffic as people stop to notice and interact with your location
	</p>
	<img
		src="/instructions/QR-step-2.png"
		class="h-60 w-60 rounded-xl border-4 border-red-800"
		alt="step 1"
	/>
	<hr class="border-px mb-6 w-full border-red-200/25" />

	<!-- Demo -->
	<h1 class="font-display text-2xl font-black">Demo</h1>
	<p class="text-center text-xs">
		Click here to view a demo of the Pillars of Hercules viewpoint (Gibraltar)
	</p>
	<button
		class="cursor-pointer rounded bg-red-800 p-2 text-white hover:scale-105"
		onclick={() => goto(resolve('/go/gibraltar/pillars-of-hercules'))}>View a demo</button
	>
	<hr class="border-px mb-6 w-full border-red-200/25" />

	<!-- Contact -->
	<h1 class="font-display text-2xl font-black">Contact us</h1>
	<a href="mailto:cmorenostokoe+gibraltar@gmail.com">
		<p class="text-center text-xs">
			Interested in hearing more or collaborating? Reach out to us at
			<span class="underline">cmorenostokoe+gibraltar@gmail.com</span>
		</p>
		<button class="mt-2 cursor-pointer rounded bg-red-800 p-2 text-white hover:scale-105"
			>Email us</button
		></a
	>
</main>
