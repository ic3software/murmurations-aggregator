import { getNodes } from '$lib/api';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const clusterId = params.cluster_id;

	try {
		const { data: nodes } = await getNodes(clusterId, fetch);

		return {
			clusterId,
			nodes
		};
	} catch (err) {
		console.error('Error loading nodes:', err);
		return {
			clusterId,
			nodes: null
		};
	}
};
