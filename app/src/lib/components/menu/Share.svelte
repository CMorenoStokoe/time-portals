<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';

	const {
		landmark
	}: {
		landmark: App.Media.Metadata;
	} = $props();

	// States
	let open = $state(false);
	let copied = $state(false);
	let imageChoice = $state<'illustrated' | 'original'>('illustrated');

	// Selected image to preview and share
	const hasReference = $derived(!!landmark.referenceFilename);
	const previewFilename = $derived(
		imageChoice === 'original' && landmark.referenceFilename
			? landmark.referenceFilename
			: landmark.filename
	);
	const previewSrc = $derived(`/media/${previewFilename}`);

	const loadImage = (src: string) =>
		new Promise<string>((resolve, reject) => {
			const img = new Image();
			img.src = src;
			img.onload = () => resolve(src);
			img.onerror = reject;
		});

	// Derived share content
	const shareUrl = $derived(page.url.href);
	const shareTitle = $derived(`${landmark.location}, ${landmark.year} — Time Portals`);
	const shareText = $derived(
		`Take a look back in time at ${landmark.location} (${landmark.year}) on Time Portals.`
	);

	const socials = $derived([
		{
			name: 'X',
			glyph: 'X',
			className: 'bg-black text-white',
			href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
		},
		{
			name: 'Facebook',
			glyph: 'f',
			className: 'bg-blue-600 text-white',
			href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
		},
		{
			name: 'WhatsApp',
			glyph: 'chat',
			className: 'bg-green-500 text-white',
			href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`
		},
		{
			name: 'Email',
			glyph: 'mail',
			className: 'bg-slate-600 text-white',
			href: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`
		}
	]);

	// Native share sheet, only offered when the browser exposes the Web Share API
	const canNativeShare = $derived(browser && typeof navigator !== 'undefined' && !!navigator.share);

	async function nativeShare() {
		const shareData: ShareData = { title: shareTitle, text: shareText, url: shareUrl };

		// Attach the actual image file when the platform supports file sharing
		try {
			const response = await fetch(previewSrc);
			const blob = await response.blob();
			const file = new File([blob], previewFilename, { type: blob.type });
			if (navigator.canShare?.({ files: [file] })) {
				shareData.files = [file];
			}
		} catch {
			// Fall back to a link-only share if the image can't be fetched as a file
		}

		try {
			await navigator.share(shareData);
		} catch {
			// User dismissed the native share sheet
		}
	}

	async function copyLink() {
		await navigator.clipboard.writeText(shareUrl);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	function close() {
		open = false;
	}

	function handleBackdropKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') close();
	}

	// Escapes ancestor stacking/containing-block contexts (e.g. backdrop-blur) so the overlay isn't clipped
	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return () => node.remove();
	}
</script>

<!-- Trigger -->
<button
	class="flex h-8 w-8 flex-col items-center justify-center rounded-full bg-stone-600 text-xl text-stone-300"
	onclick={() => (open = true)}
	aria-label="Share this landmark"
>
	<icon>share</icon>
</button>

<!-- Share sheet -->
{#if open}
	<div
		{@attach portal}
		class="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
		onclick={close}
		onkeydown={handleBackdropKeydown}
		role="button"
		tabindex="0"
		aria-label="Close share sheet"
	>
		<div
			class="w-full max-w-sm rounded-t-3xl bg-stone-900 p-4 sm:rounded-3xl"
			onclick={(event) => event.stopPropagation()}
			onkeydown={(event) => event.stopPropagation()}
			role="dialog"
			aria-modal="true"
			aria-label="Share {landmark.location}"
			tabindex="-1"
		>
			<!-- Header -->
			<header class="flex items-center justify-between pb-4">
				<p class="font-display tracking-widest text-stone-200 uppercase">Share</p>
				<button
					class="flex h-8 w-8 flex-col items-center justify-center rounded-full bg-slate-600 text-slate-300"
					onclick={close}
					aria-label="Close share sheet"
				>
					<icon>close</icon>
				</button>
			</header>

			<!-- Image preview -->
			<div class="mb-4 flex flex-col gap-2">
				{#key previewSrc}
					{#await loadImage(previewSrc)}
						<div class="h-40 w-full animate-pulse rounded-xl bg-slate-700"></div>
					{:then src}
						<img {src} alt={landmark.location} class="h-40 w-full rounded-xl object-cover" />
					{:catch}
						<div
							class="flex h-40 w-full items-center justify-center rounded-xl bg-slate-700 text-xs text-stone-400"
						>
							Preview unavailable
						</div>
					{/await}
				{/key}

				{#if hasReference}
					<div class="flex gap-2 self-center rounded-full bg-slate-800 p-1 text-xs">
						<button
							class="rounded-full px-3 py-1 {imageChoice === 'illustrated'
								? 'bg-slate-600 text-white'
								: 'text-stone-400'}"
							onclick={() => (imageChoice = 'illustrated')}
						>
							Illustrated
						</button>
						<button
							class="rounded-full px-3 py-1 {imageChoice === 'original'
								? 'bg-slate-600 text-white'
								: 'text-stone-400'}"
							onclick={() => (imageChoice = 'original')}
						>
							Original
						</button>
					</div>
				{/if}
			</div>

			<p class="pb-4 text-sm text-stone-300">{landmark.location} &mdash; {landmark.year}</p>

			<!-- Social destinations -->
			<div class="grid grid-cols-4 gap-3 pb-4">
				{#each socials as social (social.name)}
					<a
						href={social.href}
						target="_blank"
						rel="noopener noreferrer external"
						class="flex flex-col items-center gap-1 text-xs text-stone-300"
					>
						<span
							class="flex h-12 w-12 items-center justify-center rounded-full text-lg font-medium {social.className}"
						>
							{#if social.glyph === 'chat' || social.glyph === 'mail'}
								<icon>{social.glyph}</icon>
							{:else}
								{social.glyph}
							{/if}
						</span>
						{social.name}
					</a>
				{/each}
			</div>

			<!-- Copy link -->
			<button
				class="flex w-full items-center justify-center gap-2 rounded-full bg-slate-700 py-2 text-sm text-stone-200"
				onclick={copyLink}
			>
				<icon>{copied ? 'check' : 'content_copy'}</icon>
				{copied ? 'Copied!' : 'Copy link'}
			</button>

			<!-- Native share sheet, when supported -->
			{#if canNativeShare}
				<button
					class="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-slate-700 py-2 text-sm text-stone-200"
					onclick={nativeShare}
				>
					<icon>ios_share</icon>
					More options
				</button>
			{/if}
		</div>
	</div>
{/if}
