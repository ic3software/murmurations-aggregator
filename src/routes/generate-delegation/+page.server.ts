import { redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const ucanToken = cookies.get('ucan_token');

	if (!ucanToken) {
		throw redirect(302, '/');
	}

	return {
		ucanToken
	};
};
