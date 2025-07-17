import { PRIVATE_SERVER_KEY, PUBLIC_SERVER_DID_KEY } from '$env/static/private';
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
	scheme: string,
	hierPart: string,
	namespace: string,
	segments: string[]
) {
	if (!PRIVATE_SERVER_KEY) {
		throw new Error('Server Private Key is not configured');
	}

	if (!PUBLIC_SERVER_DID_KEY) {
		throw new Error('Root issuer DID key is not configured');
	}

	const keypair = ucans.EdKeypair.fromSecretKey(PRIVATE_SERVER_KEY);
	const serverDidKey = keypair.did();
	const rootIssuerDidKey = PUBLIC_SERVER_DID_KEY;

	const result = await ucans.verify(encodedUcan, {
		audience: serverDidKey,
		requiredCapabilities: [
			{
				capability: {
					with: { scheme, hierPart },
					can: { namespace, segments }
				},
				rootIssuer: rootIssuerDidKey
			}
		],
		isRevoked: async () => false
	});

	if (result.ok) {
		return result.value;
	} else {
		throw new Error('Unauthorized: ' + result.error);
	}
}
