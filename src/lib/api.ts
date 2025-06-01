import { exportPublicKey, generateKeyPair, getKey, signRequest, storeKeys } from '$lib/crypto';
import type { ApiPayload } from '$lib/types/api';
import type {
	Cluster,
	ClusterCreateInput,
	ClusterPublic,
	ClusterUpdateInput
} from '$lib/types/cluster';
import type { Keypair } from '$lib/types/keypair';
import type { Node, NodeCreateInput, NodeUpdateInput } from '$lib/types/node';

let keypair: Keypair | null = null;

async function request<TBody, TResponse>(
	url: string,
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
	body?: TBody,
	customFetch: typeof fetch = fetch
): Promise<{ data: TResponse; success: boolean; message?: string }> {
	try {
		const response = await customFetch(url, {
			method,
			body: body !== undefined ? JSON.stringify(body) : undefined,
			headers: { 'Content-Type': 'application/json' }
		});

		const json = await response.json();

		if (!response.ok) {
			return { data: null as unknown as TResponse, success: false, message: json?.message };
		}

		return json;
	} catch (error) {
		console.error(`Error on request to ${url}:`, error);
		throw error;
	}
}

export const getCountries = (customFetch?: typeof fetch) =>
	request<Record<string, string[]>, Record<string, string[]>>(
		'https://test-library.murmurations.network/v2/countries',
		'GET',
		undefined,
		customFetch
	);

export const getClusters = async (customFetch?: typeof fetch) => {
	const result = await request<undefined, Cluster[]>(
		'/api/clusters',
		'GET',
		undefined,
		customFetch
	);
	return result.data ?? [];
};

export const getCluster = (id: string, customFetch?: typeof fetch) =>
	request<undefined, ClusterPublic>(`/api/clusters/${id}`, 'GET', undefined, customFetch);

export const createCluster = (input: ClusterCreateInput, customFetch?: typeof fetch) =>
	request<ClusterCreateInput, ClusterPublic>('/api/clusters', 'POST', input, customFetch);

export const updateCluster = (
	clusterUuid: string,
	input: ClusterUpdateInput,
	customFetch?: typeof fetch
) =>
	request<ClusterUpdateInput, ClusterPublic>(
		`/api/clusters/${clusterUuid}`,
		'PUT',
		input,
		customFetch
	);

export const deleteCluster = (clusterUuid: string, customFetch?: typeof fetch) =>
	request<undefined, undefined>(`/api/clusters/${clusterUuid}`, 'DELETE', undefined, customFetch);

export const createNode = (
	clusterUuid: string,
	input: NodeCreateInput,
	customFetch?: typeof fetch
) =>
	request<NodeCreateInput, Node>(`/api/clusters/${clusterUuid}/nodes`, 'POST', input, customFetch);

export const updateNode = (
	clusterUuid: string,
	nodeId: number,
	input: NodeUpdateInput,
	customFetch?: typeof fetch
) =>
	request<NodeUpdateInput, Node>(
		`/api/clusters/${clusterUuid}/nodes/${nodeId}`,
		'PUT',
		input,
		customFetch
	);

export const getNodes = (clusterUuid: string, customFetch?: typeof fetch) =>
	request<undefined, Node[]>(`/api/clusters/${clusterUuid}/nodes`, 'GET', undefined, customFetch);

export const updateNodeStatus = (
	clusterUuid: string,
	nodeId: number,
	status: string,
	customFetch?: typeof fetch
) =>
	request<{ status: string }, Node>(
		`/api/clusters/${clusterUuid}/nodes/${nodeId}/status`,
		'PUT',
		{ status },
		customFetch
	);

export const deleteNode = (clusterUuid: string, nodeId: number, customFetch?: typeof fetch) =>
	request<undefined, undefined>(
		`/api/clusters/${clusterUuid}/nodes/${nodeId}`,
		'DELETE',
		undefined,
		customFetch
	);

export const getAuthorityMap = (clusterUuid: string, customFetch?: typeof fetch) =>
	request<undefined, string[]>(
		`/api/clusters/${clusterUuid}/authority-map`,
		'GET',
		undefined,
		customFetch
	);

export const updateClusterTimestamp = (
	clusterUuid: string,
	lastUpdated: number,
	customFetch?: typeof fetch
) =>
	request<{ lastUpdated: number }, undefined>(
		`/api/clusters/${clusterUuid}/update-timestamp`,
		'PATCH',
		{ lastUpdated },
		customFetch
	);

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

export async function hasPrivateKey(): Promise<boolean> {
	const storedPrivateKey = await getKey('privateKey');
	return !!storedPrivateKey;
}

async function fetchApi(method: string, endpoint: string, payload: ApiPayload = {}) {
	try {
		await loadKeyPair();

		if (!keypair) {
			throw new Error('No keypair found');
		}

		const xTimer = Math.floor(Date.now());
		const signature = await signRequest(payload, keypair!.privateKey);
		const xTimerSignature = await signRequest(xTimer, keypair!.privateKey);
		const res = await fetch(endpoint, {
			method,
			headers: {
				'Content-Type': 'application/json',
				'X-Timer': xTimer.toString(),
				'X-Timer-Signature': xTimerSignature,
				'X-Signature': signature,
				'X-Public-Key': await exportPublicKey(keypair!.publicKey)
			},
			body: method !== 'GET' ? JSON.stringify(payload) : undefined
		});
		return res.json();
	} catch (error) {
		console.error(`Error during ${method} ${endpoint} request:`, error);
		throw error;
	}
}

export async function fetchUsers(method: string, payload: ApiPayload = {}) {
	return await fetchApi(method, '/api/users', payload);
}

export async function fetchEmails(method: string, payload: ApiPayload = {}) {
	return await fetchApi(method, '/api/emails', payload);
}

export async function fetchKeys(method: string, payload: ApiPayload = {}) {
	return await fetchApi(method, '/api/keys', payload);
}

export async function fetchTokens(method: string, payload: ApiPayload = {}) {
	return await fetchApi(method, '/api/tokens', payload);
}

export async function fetchUserEmailReset(method: string, payload: ApiPayload = {}) {
	return await fetchApi(method, '/api/users/email-reset', payload);
}

export async function fetchEmailReset(method: string, payload: ApiPayload = {}) {
	return await fetchApi(method, '/api/emails/reset', payload);
}

export async function fetchUCAN(method: string, payload: ApiPayload = {}) {
	return await fetchApi(method, '/api/ucans', payload);
}
