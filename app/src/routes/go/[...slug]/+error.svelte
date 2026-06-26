<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	const requestedPath = page.url.pathname
		.split('/')
		.filter(Boolean)
		.map((segment) => decodeURIComponent(segment))
		.join(' / ');
</script>

{#if page.status === 404}
	<main class="flex min-h-full w-full items-center justify-center px-4 font-body text-orange-50">
		<section
			class="w-full max-w-xl rounded-2xl border border-orange-200/20 bg-stone-900/80 p-8 text-center shadow-2xl"
		>
			<p class="font-display text-sm tracking-wide text-orange-200">Error {page.status}</p>
			<h1 class="mt-2 font-display text-3xl font-black">Page Not Found</h1>
			<p class="mt-4 text-sm leading-relaxed text-orange-100/90">
				The page you requested could not be found.
			</p>
			<p class="mt-2 text-xs text-orange-200/75">
				Requested path: {requestedPath || 'Unknown path'}
			</p>
			<button
				class="mt-6 cursor-pointer rounded bg-orange-800 px-4 py-2 font-display text-white transition-transform hover:scale-105 hover:bg-orange-700"
				onclick={() => goto(resolve('/'))}>Return Home</button
			>
		</section>
	</main>
{:else}
	<main class="flex min-h-full w-full items-center justify-center px-4 font-body text-orange-50">
		<section
			class="w-full max-w-xl rounded-2xl border border-orange-200/20 bg-stone-900/80 p-8 text-center shadow-2xl"
		>
			<p class="font-display text-sm tracking-wide text-orange-200">Error {page.status}</p>
			<h1 class="mt-2 font-display text-3xl font-black">Something Went Wrong</h1>
			<p class="mt-4 text-sm leading-relaxed text-orange-100/90">
				{page.error?.message || 'An unexpected error occurred while loading this page.'}
			</p>
			<button
				class="mt-6 cursor-pointer rounded bg-orange-800 px-4 py-2 font-display text-white transition-transform hover:scale-105 hover:bg-orange-700"
				onclick={() => goto(resolve('/'))}>Return Home</button
			>
		</section>
	</main>
{/if}
