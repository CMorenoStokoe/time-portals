<script lang="ts">
	let { selectedLandmark }: { selectedLandmark: App.Media.Metadata } = $props();

	const fileWatermarkTypes: Record<string, 'veo' | 'gemini'> = {
		'Bay of Gibraltar': 'veo'
	};

	const watermarkType = $derived(
		fileWatermarkTypes[selectedLandmark.location] ??
			fileWatermarkTypes[selectedLandmark.filename]
	);

	const positions: Record<'veo' | 'gemini', string> = {
		gemini: 'right-[6%] bottom-[10%] flex h-[10%] w-[10%]',
		veo: 'right-[1%] bottom-[1%] flex h-[10%] w-[10%]'
	};

	const position = $derived(watermarkType ? positions[watermarkType] : null);
</script>

{#if position}
	<!-- Watermark -->
	<watermark class="absolute {position} rounded-full backdrop-blur">
		<img src="/svg/logo-gibraltar-xs.svg" class="h-10 w-auto" alt="Logo" />
	</watermark>
{/if}

