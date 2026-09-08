// Eras in history for filtering and differentiation on the map
// ? Note - Each era has an icon in static/svg/[countryName]/[eraName].svg
export const eras = {
	Gibraltar: [
		// 'Prehistory & Antiquity'
		// Roman/Punic rule
		{
			era: 'Islamic Rule',
			years: '711-1461',
			from: 711,
			to: 1461,
			icon: '/svg/eras/Gibraltar/Moorish.svg',
			description:
				'Gibraltar takes its name from "Jabal Tariq", meaning "The Mountain of General Tariq", and was originally named to commemorate the victory of the Umayaad Caliphate, who had one of the largest empires in known history, spanning from modern day Turkey, to North Africa, and finally into Southern Europe via Gibraltar'
		},
		{
			era: 'Spanish Rule',
			years: '1462-1703',
			from: 1462,
			to: 1703,
			icon: '/svg/eras/Gibraltar/Castilian.svg',
			description:
				'The recapture of Gibraltar in 1462 marked a final chapter in the Reconquista, and was incorporated into the Crown of Castille, and then Spain following unification'
		},
		{
			era: 'Early British Rule',
			years: '1713-1829',
			from: 1713,
			to: 1829,
			icon: '/svg/eras/Gibraltar/The Sieges.svg',
			description:
				'Gibraltar was ceeded to Britain in 1713, following the War of the Spanish Succession, and subsequently endured multiple sieges as a military garrison including the "Great Siege" of 1779'
		},
		{
			era: 'Imperial British Rule',
			icon: '/svg/eras/Gibraltar/Victorian & Edwardian.svg',
			years: '1830-1913',
			from: 1830,
			to: 1913,
			description: 'The late British Rule during the Victorian and Edwardian reigns'
		},
		{
			era: 'World Wars',
			icon: '/svg/eras/Gibraltar/World Wars.svg',
			years: '1914-1944',
			from: 1914,
			to: 1944,
			description:
				'Gibraltar played a critical role as a gatekeeper between the Mediterranean and Atlantic Seas during both world wars and the inter-war period'
		},
		{
			era: 'Civil War',
			icon: '/svg/eras/Gibraltar/Civil War.svg',
			years: '1945-1984',
			from: 1945,
			to: 1984,
			description:
				'Following the end of the Second World War, tensions with neighbouring Spain boiled over during the reign of "el Caudillo" Francisco Franco, including closing the frontier border'
		}
		// 'Modern Gibraltar'
	]
};

// Getter for convenient era classification
export const getEra = (
	year: number,
	country: string
): {
	era: string;
	years: string;
	from: number;
	to: number;
	icon: string;
	description: string;
	historicalness: number;
} => {
	// Get eras for country
	const countryEras = Object.values(eras[country as keyof typeof eras] ?? {});

	// Return matching era for the given landmark
	for (const countryEra of countryEras) {
		const { era, from, to } = countryEra;
		// Get era
		if (year >= from && year <= to) {
			// Calculate historicalness for displaying relative age
			const totalEraCount = countryEras.length;
			const eraIndex = countryEras.findIndex((d) => d.era === era);
			const historicalness = Number((100 - (100 / totalEraCount) * eraIndex - 1).toFixed(0));
			return {
				...countryEra,
				historicalness
			};
		}
	}
	return {
		era: 'Other',
		years: String(year),
		from: year,
		to: year,
		icon: '/svg/eras/Other.svg',
		description: 'Landmarks from other eras.',
		historicalness: 100
	};
};
