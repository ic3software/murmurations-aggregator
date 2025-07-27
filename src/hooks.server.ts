import { verifyUcan } from '$lib/utils/ucan-utils.server';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const ucanToken = event.cookies.get('ucan_token');
	let user = null;

	if (ucanToken) {
		try {
			const ucanData = await verifyUcan(ucanToken);
			if (ucanData) {
				user = ucanData;
			} else {
				event.cookies.delete('ucan_token', { path: '/' });
			}
		} catch {
			event.cookies.delete('ucan_token', { path: '/' });
		}
	}

	event.locals.user = user;
	return resolve(event);
};
