import { request } from '$lib/api/request';
import type {
	Cluster,
	ClusterCreateInput,
	ClusterPublic,
	ClusterUpdateInput
} from '$lib/types/cluster';

export const getClusters = async (customFetch?: typeof fetch) =>
	request<undefined, Cluster[]>('/api/clusters', 'GET', undefined, customFetch);

export const getCluster = (id: string, customFetch?: typeof fetch) =>
	request<undefined, ClusterPublic>(`/api/clusters/${id}`, 'GET', undefined, customFetch);

export const createCluster = (input: ClusterCreateInput, customFetch?: typeof fetch) =>
	request<ClusterCreateInput, ClusterPublic>('/api/clusters', 'POST', input, customFetch, true);

export const updateCluster = (
	clusterUuid: string,
	input: ClusterUpdateInput,
	customFetch?: typeof fetch
) =>
	request<ClusterUpdateInput, ClusterPublic>(
		`/api/clusters/${clusterUuid}`,
		'PUT',
		input,
		customFetch,
		true
	);

export const deleteCluster = (clusterUuid: string, customFetch?: typeof fetch) =>
	request<undefined, undefined>(
		`/api/clusters/${clusterUuid}`,
		'DELETE',
		undefined,
		customFetch,
		true
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
		customFetch,
		true
	);
