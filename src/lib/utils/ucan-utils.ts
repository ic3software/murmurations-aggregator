import type { DidableKey } from '@ucans/ucans';
import * as uint8arrays from 'uint8arrays';

export async function toDidableKey(keypair: CryptoKeyPair): Promise<DidableKey> {
	const publicKey = keypair.publicKey;
	const privateKey = keypair.privateKey;

	const publicKeyBytes = await crypto.subtle.exportKey('raw', publicKey);
	const did = publicKeyToDid(new Uint8Array(publicKeyBytes));

	return {
		jwtAlg: 'EdDSA',
		sign: async (data: Uint8Array) => {
			const sig = await crypto.subtle.sign({ name: 'Ed25519' }, privateKey, data);
			return new Uint8Array(sig);
		},
		did: () => did
	};
}

export const EDWARDS_DID_PREFIX = new Uint8Array([0xed, 0x01]);

export const publicKeyToDid = (pubkey: Uint8Array): string => {
	return didFromKeyBytes(pubkey, EDWARDS_DID_PREFIX);
};

export function didFromKeyBytes(publicKeyBytes: Uint8Array, prefix: Uint8Array): string {
	const bytes = uint8arrays.concat([prefix, publicKeyBytes]);
	const base58Key = uint8arrays.toString(bytes, 'base58btc');
	return 'did:key:z' + base58Key;
}
