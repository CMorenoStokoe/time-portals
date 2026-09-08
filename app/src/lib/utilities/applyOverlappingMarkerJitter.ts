// Calculates and applies a jitter to space out overlapping markers on the map
export const applyOverlappingMarkerJitter = (
	points: App.Media.Metadata[]
): {
	point: App.Media.Metadata;
	offset: [number, number];
	isOverlapping: boolean;
}[] => {
	const memory = new Map<string, number>();
	const jitteredPoints: {
		point: App.Media.Metadata;
		offset: [number, number];
		isOverlapping: boolean;
	}[] = [];

	points.forEach((point) => {
		const key = `${point.longitude},${point.latitude}`;
		const overlapIndex = memory.get(key) ?? 0;
		memory.set(key, overlapIndex + 1);
		const angle = overlapIndex * 2.4;
		const radius = overlapIndex === 0 ? 0 : 14;
		const offsetX = Math.cos(angle) * radius * 2;
		const offsetY = Math.sin(angle) * radius * 2;
		const isOverlapping = overlapIndex !== 0;
		jitteredPoints.push({ offset: [offsetX, offsetY], isOverlapping, point });
	});

	return jitteredPoints;
};
