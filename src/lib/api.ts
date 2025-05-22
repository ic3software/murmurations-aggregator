import type { Cluster, ClusterCreateInput, ClusterUpdateInput } from './types/cluster';
import type { NodeCreateInput } from './types/node';

export async function getCountries(
	customFetch: typeof fetch = fetch
): Promise<Record<string, string[]>> {
	try {
		const response = await customFetch('https://test-library.murmurations.network/v2/countries', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error('Failed to fetch countries');
		}

		const data: Record<string, string[]> = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching countries:', error);
		throw error;
	}
}

export async function getClusters(customFetch: typeof fetch = fetch): Promise<Cluster[]> {
	try {
		const response = await customFetch('/api/clusters', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error('Failed to fetch clusters');
		}

		const result = await response.json();
		const data: Cluster[] = result.data;
		return data ?? [];
	} catch (error) {
		console.error('Error fetching clusters:', error);
		throw error;
	}
}

export async function getCluster(clusterId: string, customFetch: typeof fetch = fetch) {
	try {
		const response = await customFetch(`/api/clusters/${clusterId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error('Failed to fetch cluster');
		}

		const result = await response.json();
		const data: Cluster = result.data;
		return data;
	} catch (error) {
		console.error('Error fetching cluster:', error);
		throw error;
	}
}

export async function createCluster(
	cluster: ClusterCreateInput,
	customFetch: typeof fetch = fetch
) {
	try {
		const response = await customFetch(`/api/clusters`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(cluster)
		});

		if (!response.ok) {
			throw new Error('Failed to create cluster');
		}

		return response.json();
	} catch (error) {
		console.error('Error creating cluster:', error);
		throw error;
	}
}

export async function updateCluster(
	clusterId: string,
	cluster: ClusterUpdateInput,
	customFetch: typeof fetch = fetch
) {
	try {
		const response = await customFetch(`/api/clusters/${clusterId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(cluster)
		});

		if (!response.ok) {
			throw new Error('Failed to update cluster');
		}

		return response.json();
	} catch (error) {
		console.error('Error updating cluster:', error);
		throw error;
	}
}

export async function deleteCluster(clusterId: string, customFetch: typeof fetch = fetch) {
	try {
		const response = await customFetch(`/api/clusters/${clusterId}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error('Failed to delete cluster');
		}

		return response.json();
	} catch (error) {
		console.error('Error deleting cluster:', error);
		throw error;
	}
}

export async function createNode(
	clusterId: string,
	node: NodeCreateInput,
	customFetch: typeof fetch = fetch
) {
	try {
		const response = await customFetch(`/api/clusters/${clusterId}/nodes`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(node)
		});

		if (!response.ok) {
			throw new Error('Failed to post node');
		}

		return response.json();
	} catch (error) {
		console.error('Error posting node:', error);
		throw error;
	}
}

export async function getNodes(clusterId: string, customFetch: typeof fetch = fetch) {
	try {
		const response = await customFetch(`/api/clusters/${clusterId}/nodes`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error('Failed to fetch nodes');
		}

		return response.json();
	} catch (error) {
		console.error('Error fetching nodes:', error);
		throw error;
	}
}
