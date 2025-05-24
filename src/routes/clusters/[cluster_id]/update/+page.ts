import { getCluster, getNodes } from '$lib/api';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const clusterId = params.cluster_id;

	const { data: cluster } = await getCluster(clusterId, fetch);
	const { data: nodes } = await getNodes(clusterId, fetch);

	return {
		cluster,
		nodes
	};
};
