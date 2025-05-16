import type { Cluster, ClusterRequest } from './types/cluster';

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

export async function createCluster(cluster: ClusterRequest) {
	try {
		const response = await fetch(`/api/clusters`, {
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
