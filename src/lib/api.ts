import type {
	Cluster,
	ClusterCreateInput,
	ClusterPublic,
	ClusterUpdateInput
} from '$lib/types/cluster';
import type { Node, NodeCreateInput, NodeUpdateInput } from '$lib/types/node';

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
