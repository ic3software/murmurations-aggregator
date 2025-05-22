import type { PageLoad } from './$types';
import { getNodes } from '$lib/api';

export const load: PageLoad = async ({ fetch, params }) => {
	const clusterId = params.cluster_id;

	const nodesData = await getNodes(clusterId, fetch);

	if (!nodesData.success) {
		throw new Error(nodesData.error || 'Failed to load nodes');
	}

	return {
		clusterId,
		nodes: nodesData?.data
	};
};
