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
