import { request } from '$lib/api/request';
import type { User } from '$lib/types/user';

export const getUser = (customFetch?: typeof fetch) =>
	request<undefined, User>('/api/users', 'GET', undefined, customFetch);

export const createUser = (input: { name: string }, customFetch?: typeof fetch) =>
	request<{ name: string }, { public_key: string }>('/api/users', 'POST', input, customFetch);

export const resetEmail = (emailReset: boolean, customFetch?: typeof fetch) =>
	request<{ emailReset: boolean }, undefined>(
		'/api/users/email-reset',
		'PATCH',
		{ emailReset },
		customFetch
	);
