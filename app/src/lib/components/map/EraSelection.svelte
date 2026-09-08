<script lang="ts">
	import { eras, getEra } from '$lib/data/eras';

	let {
		selected,
		country,
		handleFilterEra
	}: {
		selected?: string;
		country: string;
		handleFilterEra: (era?: string) => void;
	} = $props();

	//  Data
	let options = $derived(
		eras[country as keyof typeof eras].map(({ from }) => getEra(from, country))
	);

	// Centers the clicked button within the scrollable container
	const scrollIntoView = (e: MouseEvent) => {
		(e.currentTarget as HTMLElement).scrollIntoView({
			behavior: 'smooth',
			inline: 'center',
			block: 'nearest'
		});
	};

	// Handlers
	const handleClickEra = (e: MouseEvent, era?: string) => {
		handleFilterEra(era);
		scrollIntoView(e);
	};
</script>

<!-- Era options -->
<div
	class="box-border overflow-x-auto"
	style="scrollbar-width:none; max-width: calc(100vw - 4.5rem);"
>
	<!-- Timeline -->
	<div class="relative flex flex-row items-start justify-start gap-0.5">
		<button
			onclick={(e) => handleClickEra(e)}
			class="rounded-full border border-white/25 px-3 pt-2 pb-1.5 transition-all {!selected
				? 'bg-slate-500 text-white'
				: 'bg-slate-300/60 backdrop-blur'}"
		>
			<p class="text-xs leading-2 text-nowrap">
				All<br /><span class="text-[8px]">eras</span>
			</p>
		</button>
		{#each options as { era, historicalness, years, icon } (era)}
			<button
				onclick={(e) => handleClickEra(e, era)}
				class="relative flex flex-row items-start gap-0.5 rounded-full border border-white/25 px-2 py-1 text-start transition-all {era ===
				selected
					? 'bg-gibraltar-primary text-white'
					: 'bg-gibraltar-primary/25  backdrop-blur'}"
				style="filter: {historicalness > 50 ? 'grayscale' : 'sepia'}({historicalness}%);"
			>
				<div
					class="flex h-4 min-h-4 w-4 min-w-4 flex-col items-center justify-center rounded-full border border-white bg-red-500/90 p-px"
				>
					<img src={icon} class="h-8 w-8" alt={era} />
				</div>
				<p class="pt-0.5 text-xs leading-2.5 text-nowrap">
					{era} <br /><span class="text-[8px]">{years} AD</span>
				</p>
			</button>
		{/each}
	</div>
</div>

<!-- Timeline style
<div class="box-border overflow-x-auto" style="scrollbar-width:none; max-width: calc(100% - 4rem);">
	<!-- Timeline  
	<div
		class="relative flex flex-row items-start justify-start gap-1 rounded-full bg-slate-300/60 pt-2 text-[8px] backdrop-blur"
	>
		<hr class="absolute top-7.5 -z-10 w-full border-2 border-white" />
		<!-- Eras 
		<button
			onclick={(e) => {
				handleFilterEra();
				scrollIntoView(e);
			}}
			class="flex flex-row items-center gap-1 rounded-full p-2 transition-all {!selected
				? 'bg-white font-medium text-black'
				: ''}"
		>
			<p>All eras</p>
		</button>
		{#each options as { era, historicalness, startYear } (era)}
			<button
				onclick={(e) => {
					handleFilterEra(era);
					scrollIntoView(e);
				}}
				class="relative flex flex-col items-center rounded-full px-2 py-1 transition-all {era ===
				selected
					? 'bg-white font-medium '
					: ''}"
				style="{historicalness > 50 ? 'grayscale' : 'sepia'}({historicalness}%)"
			>
				<p class="rounded-full bg-white px-1">{startYear}</p>
				<div
					class="flex h-4 min-h-4 w-4 min-w-4 flex-col items-center justify-center rounded-full border border-white bg-red-500/90 p-px"
				>
					<img src="/svg/eras/{country}/{era}.svg" class="h-8 w-8" alt={era} />
				</div>
				<p class="rounded-full bg-white px-1">{era}</p>
			</button>
		{/each}
	</div>
</div>-->
