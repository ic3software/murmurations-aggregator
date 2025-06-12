import { getCluster } from '$lib/api/clusters';
import { getPublishedNodes } from '$lib/api/nodes';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, url }) => {
	const clusterUuid = params.cluster_uuid;

	const page = parseInt(url.searchParams.get('page') ?? '1', 10);
	const currentPage = isNaN(page) || page < 1 ? 1 : page;

	const { data: cluster } = await getCluster(clusterUuid, fetch);
	const { data: nodes, meta } = await getPublishedNodes(clusterUuid, currentPage, fetch);

	return {
		title: cluster?.name || 'Nodes List',
		cluster,
		nodes,
		meta
	};
};
