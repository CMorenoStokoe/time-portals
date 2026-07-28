export const boomerangVideoLoop = (video: HTMLVideoElement, reverseSpeed = 1) => {
	let reversing = false;
	let destroyed = false;
	let animationFrame = 0;
	let reverseStartedAt = 0;
	let reverseStartedFrom = 0;

	const playForward = async () => {
		reversing = false;
		video.currentTime = 0;

		try {
			await video.play();
		} catch (error) {
			console.error('Could not restart video:', error);
		}
	};

	const reverse = (now: number) => {
		if (!reversing || destroyed) return;

		const elapsed = ((now - reverseStartedAt) / 1000) * reverseSpeed;
		const targetTime = reverseStartedFrom - elapsed;

		if (targetTime <= 0) {
			void playForward();
			return;
		}

		if (!video.seeking) {
			if ('fastSeek' in video) {
				video.fastSeek(targetTime);
			} else {
				video.currentTime = targetTime;
			}
		}

		animationFrame = requestAnimationFrame(reverse);
	};

	const handleEnded = () => {
		video.pause();

		reversing = true;
		reverseStartedAt = performance.now();
		reverseStartedFrom = video.duration;

		animationFrame = requestAnimationFrame(reverse);
	};

	video.addEventListener('ended', handleEnded);

	return () => {
		destroyed = true;
		reversing = false;

		cancelAnimationFrame(animationFrame);
		video.removeEventListener('ended', handleEnded);
	};
};
