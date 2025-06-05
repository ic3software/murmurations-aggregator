import { request } from '$lib/api/request';

export const getCountries = (customFetch?: typeof fetch) =>
	request<Record<string, string[]>, Record<string, string[]>>(
		'https://test-library.murmurations.network/v2/countries',
		'GET',
		undefined,
		customFetch
	);
