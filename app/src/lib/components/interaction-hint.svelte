<script lang="ts">
	import { onMount } from 'svelte';
	let { class: className = '' }: { class?: string } = $props();

	let icons = ['mobile_rotate', 'mobile_rotate#right', 'swipe_left', 'swipe_right'];
	let icon = $state(icons[0]);

	onMount(() => {
		const interval = setInterval(() => {
			icon = icons[(icons.indexOf(icon) + 1) % icons.length] as
				| 'swipe_left'
				| 'swipe_right'
				| 'mobile_rotate';
		}, 1500);
		return () => clearInterval(interval); // Cleanup
	});
</script>

<div class="animated pointer-events-none flex flex-row items-center gap-2 {className}">
	<icon class="icon text-4xl! {icon.includes('#right') ? '-scale-x-100' : ''}"
		>{icon.replace('#right', '')}</icon
	>
</div>

<style>
	.animated {
		animation: animation 3s ease-in-out infinite;
	}
	@keyframes animation {
		0% {
			transform: translateX(0) rotate(0);
			opacity: 1;
		}
		25% {
			transform: translateX(-5px) rotate(-10deg);
			opacity: 0.5;
		}
		50% {
			transform: translateX(0) rotate(0);
			opacity: 1;
		}
		75% {
			transform: translateX(5px) rotate(10deg);
			opacity: 0.5;
		}
		100% {
			transform: translateX(0) rotate(0);
			opacity: 1;
		}
	}
</style>
