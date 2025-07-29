import { request } from '$lib/api/request';

export const getCountries = (url: string, customFetch?: typeof fetch) =>
	request<Record<string, string[]>, Record<string, string[]>>(
		url,
		'GET',
		undefined,
		customFetch,
		false
	);
