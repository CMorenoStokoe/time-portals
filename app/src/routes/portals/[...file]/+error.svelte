<script lang="ts">
	import { page } from '$app/state';
	const location = page.url.pathname
		.split('/')
		.filter((route) => route && route !== 'portals')
		.join(', ');
</script>

<!-- Nice error page for 404 -->
{#if page.status === 404}
	<div
		class="relative z-0 flex h-full w-full flex-col items-center justify-center gap-4 text-white"
	>
		<div class="portal-border absolute -z-10 h-3/4 w-1/2 rounded-full bg-transparent"></div>
		<h1 class="text-8xl! font-bold">{page.status}</h1>
		<p class="max-w-5/12 text-center">
			We haven't opened a portal to {location} yet.
			<br /><br />
			<em>Please let us know you are interested!</em>
		</p>
	</div>
{:else}
	<!-- All other errors -->
	<h1 class="text-9xl! font-bold">{page.status}</h1>
	<p>{page.error?.message}</p>
{/if}

<style>
	.portal-border {
		border: 10px solid transparent;
		background:
			radial-gradient(circle at center, #312e81 0%, #111827 45%, #000000 100%) padding-box,
			linear-gradient(90deg, #1e1b4b, #06b6d4, #7c3aed, #ec4899, #1e1b4b);
		background-size:
			100% 100%,
			300% 100%;
		animation: rainbow-move 4s linear infinite;
	}

	@keyframes rainbow-move {
		from {
			background-position:
				0 0,
				0 0;
		}
		to {
			background-position:
				0 0,
				300% 0;
		}
	}
</style>
