import { request } from '$lib/api/request';

export const getSchemas = (url: string, customFetch?: typeof fetch) =>
	request<undefined, { name: string }[]>(url, 'GET', undefined, customFetch);
