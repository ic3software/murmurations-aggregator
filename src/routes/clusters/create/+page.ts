import type { PageLoad } from './$types';
import { getCountries } from '$lib/api';

export const load: PageLoad = async ({ fetch }) => {
	const rawCountries = await getCountries(fetch);

	const countries = Object.entries(rawCountries).map(([key, names]) => ({
		value: key,
		// Use the second element as the label if available, otherwise use the first element
		label: Array.isArray(names)
			? (names[1] || names[0])
					.split(' ')
					.map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(' ')
			: ''
	}));

	return {
		countries
	};
};
