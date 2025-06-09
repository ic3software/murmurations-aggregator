import { request } from '$lib/api/request';
import type { Node, NodeCreateInput, NodeUpdateInput } from '$lib/types/node';

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

export const getPublishedNodes = (clusterUuid: string, customFetch?: typeof fetch) =>
	request<undefined, Node[]>(
		`/api/clusters/${clusterUuid}/published-nodes`,
		'GET',
		undefined,
		customFetch
	);

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
