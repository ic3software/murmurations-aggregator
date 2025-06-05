import { request } from '$lib/api/request';
import type { PublicKey } from '$lib/types/key';

export const getPublicKeys = (customFetch?: typeof fetch) =>
	request<undefined, { publicKeys: PublicKey[]; currentPublicKey: string }>(
		'/api/keys',
		'GET',
		undefined,
		customFetch,
		true
	);

export const linkPublicKey = (token: string, customFetch?: typeof fetch) =>
	request<{ token: string }, { publicKey: string }>(
		'/api/keys',
		'POST',
		{ token },
		customFetch,
		true
	);

export const deletePublicKey = (publicKey: string, customFetch?: typeof fetch) =>
	request<{ publicKey: string }, undefined>(
		'/api/keys',
		'DELETE',
		{ publicKey },
		customFetch,
		true
	);
