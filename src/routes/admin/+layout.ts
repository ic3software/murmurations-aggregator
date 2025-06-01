import { browser } from '$app/environment';
import { fetchKeys } from '$lib/api.js';
import { redirect } from '@sveltejs/kit';

export async function load({ url }) {
	if (browser) {
		// exlcude login and register pages
		if (url.pathname === '/admin/login' || url.pathname === '/admin/register') {
			return;
		}

		try {
			const { success, error } = await fetchKeys('GET');
			if (!success || error) {
				throw redirect(302, '/admin/register');
			}
		} catch (e) {
			console.error('Error checking for private key', e);
			throw redirect(302, '/admin/register');
		}
	}
}
