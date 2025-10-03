import { getCluster } from '$lib/api/clusters';
import { getPublishedMapNodes } from '$lib/api/nodes';

import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async ({ fetch, params }) => {
	const clusterUuid = params.cluster_uuid;

	const { data: cluster } = await getCluster(clusterUuid, fetch);
	const { data: nodes } = await getPublishedMapNodes(clusterUuid, '', '', {}, fetch);

	return {
		title: cluster?.name || 'Embedded Map',
		cluster,
		nodes
	};
};
