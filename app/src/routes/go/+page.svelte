<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<p class="text-xl">Location catalog</p>
<p>This page lists all the available locations we currently support.</p>
<ul>
	{#each data.locations as { url, meta } (url)}
		<li><a href={resolve(url)}>{meta.location} — {meta.year} ({meta.country})</a></li>
	{/each}
</ul>
