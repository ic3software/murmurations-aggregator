import type { Cluster, ClusterCreateInput, ClusterUpdateInput } from './types/cluster';
import type { NodeCreateInput, NodeUpdateInput } from './types/node';

async function request<T>(
	url: string,
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
	body?: T,
	customFetch: typeof fetch = fetch
): Promise<T> {
	try {
		const response = await customFetch(url, {
			method,
			body: body ? JSON.stringify(body) : undefined,
			headers: { 'Content-Type': 'application/json' }
		});

		if (!response.ok) {
			throw new Error(`Request failed: ${response.status} ${response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error(`Error on request to ${url}:`, error);
		throw error;
	}
}

export const getCountries = (customFetch?: typeof fetch) =>
	request<Record<string, string[]>>(
		'https://test-library.murmurations.network/v2/countries',
		'GET',
		undefined,
		customFetch
	);

export const getClusters = async (customFetch?: typeof fetch) => {
	const result = await request<{ data: Cluster[] }>('/api/clusters', 'GET', undefined, customFetch);
	return result.data ?? [];
};

export const getCluster = (id: string, customFetch?: typeof fetch) =>
	request<{ data: Cluster }>(`/api/clusters/${id}`, 'GET', undefined, customFetch).then(
		(res) => res.data
	);

export const createCluster = (input: ClusterCreateInput, customFetch?: typeof fetch) =>
	request('/api/clusters', 'POST', input, customFetch);

export const updateCluster = (id: string, input: ClusterUpdateInput, customFetch?: typeof fetch) =>
	request(`/api/clusters/${id}`, 'PUT', input, customFetch);

export const deleteCluster = (id: string, customFetch?: typeof fetch) =>
	request(`/api/clusters/${id}`, 'DELETE', undefined, customFetch);

export const createNode = (clusterId: string, input: NodeCreateInput, customFetch?: typeof fetch) =>
	request(`/api/clusters/${clusterId}/nodes`, 'POST', input, customFetch);

export const updateNode = (
	clusterId: string,
	nodeId: number,
	input: NodeUpdateInput,
	customFetch?: typeof fetch
) => request(`/api/clusters/${clusterId}/nodes/${nodeId}`, 'PUT', input, customFetch);

export const getNodes = (clusterId: string, customFetch?: typeof fetch) =>
	request(`/api/clusters/${clusterId}/nodes`, 'GET', undefined, customFetch);

export const updateNodeStatus = (
	clusterId: string,
	nodeId: number,
	status: string,
	customFetch?: typeof fetch
) => request(`/api/clusters/${clusterId}/nodes/${nodeId}/status`, 'PUT', { status }, customFetch);

export const deleteNode = (clusterId: string, nodeId: number, customFetch?: typeof fetch) =>
	request(`/api/clusters/${clusterId}/nodes/${nodeId}`, 'DELETE', undefined, customFetch);

export const getAuthorityMap = (clusterId: string, customFetch?: typeof fetch) =>
	request(`/api/clusters/${clusterId}/authority-map`, 'GET', undefined, customFetch);

export const updateClusterTimestamp = (
	clusterId: string,
	lastUpdated: Date,
	customFetch?: typeof fetch
) => request(`/api/clusters/${clusterId}/update-timestamp`, 'PATCH', { lastUpdated }, customFetch);
