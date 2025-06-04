import { request } from '$lib/api/request';
import type { LoginToken } from '$lib/types/token';

export const getTokens = (customFetch?: typeof fetch) =>
	request<undefined, LoginToken[]>('/api/tokens', 'GET', undefined, customFetch, true);

export const createToken = (customFetch?: typeof fetch) =>
	request<undefined, LoginToken>('/api/tokens', 'POST', undefined, customFetch, true);

export const deleteToken = (token: string, customFetch?: typeof fetch) =>
	request<{ token: string }, undefined>('/api/tokens', 'DELETE', { token }, customFetch, true);
