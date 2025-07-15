import { browser } from '$app/environment';
import { getPublicKeys } from '$lib/api/keys';
import { redirect } from '@sveltejs/kit';

export async function load({ url }) {
	if (browser) {
		// exlcude login and register pages
		if (url.pathname === '/login' || url.pathname === '/register') {
			return;
		}

		try {
			const { success, error } = await getPublicKeys();
			if (!success || error) {
				throw redirect(302, '/register');
			}
		} catch (e) {
			console.error('Error checking for private key', e);
			throw redirect(302, '/register');
		}
	}
}
