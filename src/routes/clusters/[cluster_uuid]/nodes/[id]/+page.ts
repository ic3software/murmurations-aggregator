import { getCluster } from '$lib/api/clusters';
import { getPublishedNode } from '$lib/api/nodes';

import type { PageLoad } from '../$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const clusterUuid = params.cluster_uuid;
	const nodeId = params.id;

	const { data: cluster } = await getCluster(clusterUuid, fetch);
	const { data: node } = await getPublishedNode(clusterUuid, nodeId, fetch);

	return {
		title: cluster?.name || 'Nodes',
		cluster,
		node
	};
};
