<script lang="ts">
	let { selectedLandmark }: { selectedLandmark: App.Media.Metadata } = $props();

	// Specific videos or locations that require a watermark can be listed here.
	// Default action is to show NO watermark on videos.
	const fileWatermarkTypes: Record<string, 'veo' | 'gemini'> = {};

	const watermarkType = $derived(
		fileWatermarkTypes[selectedLandmark.location] ??
			fileWatermarkTypes[selectedLandmark.filename] ??
			(selectedLandmark.referenceFilename
				? fileWatermarkTypes[selectedLandmark.referenceFilename]
				: undefined)
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

