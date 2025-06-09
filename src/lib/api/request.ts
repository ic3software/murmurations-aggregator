import { exportPublicKey, signRequest } from '$lib/crypto';
import { generateKeyPair, getKey, storeKeys } from '$lib/crypto';
import type { Keypair } from '$lib/types/keypair';

let keypair: Keypair | null = null;

export async function request<TBody, TResponse>(
	url: string,
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
	body?: TBody,
	customFetch: typeof fetch = fetch,
	signed = false
): Promise<{ data: TResponse; success: boolean; message?: string; error?: string }> {
	try {
		const headers: HeadersInit = {
			'Content-Type': 'application/json'
		};

		const requestBody = body !== undefined ? JSON.stringify(body) : undefined;

		if (signed) {
			await loadKeyPair();
			if (!keypair) {
				throw new Error('No keypair found');
			}

			const xTimer = Math.floor(Date.now());

			const signature = await signRequest(requestBody || '{}', keypair!.privateKey);
			const xTimerSignature = await signRequest(xTimer.toString(), keypair!.privateKey);
			const publicKey = await exportPublicKey(keypair.publicKey);

			headers['X-Timer'] = xTimer.toString();
			headers['X-Timer-Signature'] = xTimerSignature;
			headers['X-Signature'] = signature;
			headers['X-Public-Key'] = publicKey;
		}

		const response = await customFetch(url, {
			method,
			headers,
			body: requestBody
		});

		const json = await response.json();

		if (!response.ok) {
			return {
				data: null as unknown as TResponse,
				success: false,
				message: json?.message,
				error: json?.error
			};
		}

		return json;
	} catch (error) {
		console.error(`Error on request to ${url}:`, error);
		throw error;
	}
}

async function loadKeyPair() {
	if (!keypair) {
		const storedPrivateKey = await getKey('privateKey');
		if (storedPrivateKey) {
			keypair = {
				publicKey: (await getKey('publicKey')) as CryptoKey,
				privateKey: storedPrivateKey
			};
		} else {
			keypair = await generateKeyPair();
			await storeKeys(keypair.publicKey, keypair.privateKey);
		}
	}
}
