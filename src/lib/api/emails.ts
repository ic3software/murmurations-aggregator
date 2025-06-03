import { request } from '$lib/api/request';

export const getEmails = (customFetch?: typeof fetch) =>
	request<undefined, { email: string }[]>('/api/emails', 'GET', undefined, customFetch, true);

export const addEmail = (email: string, customFetch?: typeof fetch) =>
	request<{ email: string }, { email: string }>(
		'/api/emails',
		'POST',
		{ email },
		customFetch,
		true
	);

export const deleteEmail = (email: string, customFetch?: typeof fetch) =>
	request<{ email: string }, { email: string; emailReset: boolean }>(
		'/api/emails',
		'DELETE',
		{ email },
		customFetch,
		true
	);

export const sendResetEmailRequest = (email: string, customFetch?: typeof fetch) =>
	request<{ email: string }, { email: string }>(
		'/api/emails/send-reset-request',
		'POST',
		{ email },
		customFetch,
		false
	);
