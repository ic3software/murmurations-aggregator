import type { PageLoad } from './$types';
import { getCluster } from '$lib/api';

export const load: PageLoad = async ({ fetch, params }) => {
	const clusterId = params.cluster_id;
	const cluster = await getCluster(clusterId, fetch);

	cluster.clusterId = clusterId;

	return {
		cluster
	};
};
