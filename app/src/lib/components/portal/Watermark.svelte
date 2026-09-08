<script lang="ts">
	let { selectedLandmark }: { selectedLandmark: App.Media.Metadata } = $props();

	const fileWatermarkTypes: Record<string, 'veo' | 'gemini'> = {
		'Bay of Gibraltar': 'veo'
	};

	let position = $derived(
		{
			gemini: 'right-[6%] bottom-[10%] flex h-[10%] w-[10%]',
			veo: 'right-[1%] bottom-[1%] flex h-[10%] w-[10%]'
		}[fileWatermarkTypes[selectedLandmark.location] ?? 'gemini']
	);
</script>

<!-- Watermark -->
<watermark class="absolute {position} rounded-full backdrop-blur">
	<img src="/svg/logo-gibraltar-xs.svg" class="h-10 w-auto" alt="Logo" />
</watermark>
