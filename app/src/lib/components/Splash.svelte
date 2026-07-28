<script lang="ts">
	import { onMount } from 'svelte';

	let isColored = $state(false);
	onMount(() => {
		const timeout = setTimeout(() => {
			isColored = true;
		}, 250);
		return () => clearTimeout(timeout);
	});
</script>

<!-- Logo -->
<div class="flex h-full w-full flex-col items-center justify-center">
	<img
		src="/svg/logo-gibraltar-alt.svg"
		class="h-30 w-auto transition-all duration-1000 {isColored ? 'grayscale-0' : 'grayscale-100'}"
		alt="logo"
	/>
</div>
