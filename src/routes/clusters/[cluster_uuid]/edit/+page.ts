import { getCluster } from '$lib/api';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const clusterUuid = params.cluster_uuid;

	try {
		const { data: cluster } = await getCluster(clusterUuid, fetch);

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
