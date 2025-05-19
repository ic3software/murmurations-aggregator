import { getClusters } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const clusters = await getClusters(fetch);

	return {
		clusters
	};
};
