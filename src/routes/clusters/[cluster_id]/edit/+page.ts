import type { PageLoad } from './$types';
import { getCluster } from '$lib/api';

export const load: PageLoad = async ({ fetch, params }) => {
	const clusterId = params.cluster_id;

	try {
		const { data: cluster } = await getCluster(clusterId, fetch);

		return {
			cluster
		};
	} catch (err) {
		console.error('Error loading cluster:', err);
		return {
			cluster: null
		};
	}
};
