import { exportPublicKey, generateKeyPair, getKey, signRequest, storeKeys } from '$lib/crypto';
import type { Keypair } from '$lib/types/keypair';

let keypair: Keypair | null = null;

export async function register(name: string): Promise<{
	data: { token: string };
	success: boolean;
	error?: string;
}> {
	try {
		const headers: HeadersInit = {
			'Content-Type': 'application/json'
		};

		const body = { name };
		const requestBody = JSON.stringify(body);

		await loadKeyPair();
		if (!keypair) {
			throw new Error('No keypair found');
		}

		const xTimer = Math.floor(Date.now());

		const signature = await signRequest(requestBody, keypair!.privateKey);
		const xTimerSignature = await signRequest(xTimer.toString(), keypair!.privateKey);
		const publicKey = await exportPublicKey(keypair.publicKey);

		headers['X-Timer'] = xTimer.toString();
		headers['X-Timer-Signature'] = xTimerSignature;
		headers['X-Signature'] = signature;
		headers['X-Public-Key'] = publicKey;

		const response = await fetch('/api/register', {
			method: 'POST',
			headers,
			body: requestBody
		});

		const json = await response.json();

		if (!response.ok) {
			return {
				data: null as unknown as { token: string },
				error: json.error,
				success: false
			};
		}

		return json;
	} catch (error) {
		console.error(`Error on register request:`, error);
		return {
			data: null as unknown as { token: string },
			success: false,
			error: error instanceof Error ? error.message : 'An unknown error occurred'
		};
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
