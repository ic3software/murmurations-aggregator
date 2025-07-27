import { PRIVATE_SERVER_KEY } from '$env/static/private';
import { PUBLIC_SERVER_DID_KEY } from '$env/static/public';
import type { UcanCapability } from '$lib/types/ucan';
import * as ucans from '@ucans/ucans';

export async function verifyUcan(ucanToken: string) {
	try {
		const ucan = ucans.parse(ucanToken);

		const now = Math.floor(Date.now() / 1000);
		if (ucan.payload.exp && ucan.payload.exp < now) {
			return null;
		}

		return ucan.payload.aud.toString();
	} catch (error) {
		console.error('Error verifying UCAN:', error);
		return null;
	}
}

export async function verifyUcanWithCapabilities(
	encodedUcan: string,
	audience: string,
	scheme: string,
	hierPart: string,
	namespace: string,
	segments: string[]
) {
	if (!PUBLIC_SERVER_DID_KEY) {
		throw new Error('Root issuer DID key is not configured');
	}

	const rootIssuerDidKey = PUBLIC_SERVER_DID_KEY;

	const result = await ucans.verify(encodedUcan, {
		audience,
		requiredCapabilities: [
			{
				capability: {
					with: { scheme, hierPart },
					can: { namespace, segments }
				},
				rootIssuer: rootIssuerDidKey
			}
		]
	});

	if (result.ok) {
		return result.value;
	} else {
		return false;
	}
}

export async function buildUcan(userPublicKey: string, lifetimeInSeconds: number) {
	if (!PRIVATE_SERVER_KEY) {
		throw new Error('Server Private Key is not configured');
	}

	const keypair = ucans.EdKeypair.fromSecretKey(PRIVATE_SERVER_KEY);
	const ucanToken = await ucans.build({
		issuer: keypair,
		audience: 'did:key:z' + userPublicKey,
		lifetimeInSeconds
	});

	return ucans.encode(ucanToken);
}

export async function buildUcanWithCapabilities(
	userPublicKey: string,
	lifetimeInSeconds: number,
	capabilities: UcanCapability[]
) {
	if (!PRIVATE_SERVER_KEY) {
		throw new Error('Server Private Key is not configured');
	}

	const keypair = ucans.EdKeypair.fromSecretKey(PRIVATE_SERVER_KEY);
	const ucanToken = await ucans.build({
		issuer: keypair,
		audience: 'did:key:z' + userPublicKey,
		lifetimeInSeconds,
		capabilities: capabilities.map((capability) => ({
			with: { scheme: capability.scheme, hierPart: capability.hierPart },
			can: { namespace: capability.namespace, segments: capability.segments }
		}))
	});

	return ucans.encode(ucanToken);
}
