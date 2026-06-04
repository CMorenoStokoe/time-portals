<script lang="ts">
	import { onMount } from 'svelte';
	import { requestGyroPermission } from '$lib/utilities/useGyroScroll';

	let { onEnabled = () => {} }: { onEnabled?: () => void } = $props();
	let requiresPermission = $state(false);

	onMount(() => {
		if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) return;
		const OrientationEvent = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
			requestPermission?: () => Promise<'granted' | 'denied'>;
		};

		requiresPermission = !!OrientationEvent.requestPermission;
		if (!requiresPermission) onEnabled();
	});

	const enableGyro = async () => {
		const granted = await requestGyroPermission();
		requiresPermission = !granted;
		if (granted) onEnabled();
	};
</script>

{#if requiresPermission}
	<div class="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
		<button
			class="cursor-pointer rounded bg-orange-800 px-4 py-2 font-display text-sm text-white hover:bg-orange-700"
			onclick={enableGyro}
		>
			Enable Gyro Scroll
		</button>
	</div>
{/if}
