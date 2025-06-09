import { getCluster } from '$lib/api/clusters';
import { getPublishedNodes } from '$lib/api/nodes';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const clusterUuid = params.cluster_uuid;

	const { data: cluster } = await getCluster(clusterUuid, fetch);
	const { data: nodes } = await getPublishedNodes(clusterUuid, fetch);

	return {
		title: cluster?.name || 'Nodes List',
		cluster,
		nodes
	};
};
