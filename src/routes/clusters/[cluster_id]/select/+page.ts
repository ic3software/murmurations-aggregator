import type { PageLoad } from './$types';
import { getNodes } from '$lib/api';

export const load: PageLoad = async ({ fetch, params }) => {
	const clusterId = params.cluster_id;

	const { data: nodes } = await getNodes(clusterId, fetch);

	return {
		clusterId,
		nodes
	};
};
