<script lang="ts">
	let { data } = $props(); // Svelte 5
	// In SvelteKit, a +server.js in the same folder as a +page.svelte
	// can be accessed by the current URL.
</script>

<video
	class="h-full w-full bg-black object-cover"
	controls={null}
	preload="metadata"
	autoplay
	loop
	muted
>
	<source src="?raw=true" type="video/mp4" />
</video>
