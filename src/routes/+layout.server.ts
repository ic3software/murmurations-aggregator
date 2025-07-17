import { redirect } from '@sveltejs/kit';

import type { LayoutServerLoad } from './$types';

const publicRoutes = ['/', '/login', '/register', '/profile-generator', '/batch-importer'];

export const load: LayoutServerLoad = async ({ url, locals }) => {
	// exlcude public routes
	if (!publicRoutes.includes(url.pathname)) {
		if (!locals.user) {
			throw redirect(302, '/register');
		}
	}

	// If user is logged in, redirect to the home page if they're in login or register
	if (locals.user && (url.pathname === '/login' || url.pathname === '/register')) {
		throw redirect(302, '/');
	}

	return {
		user: locals.user
	};
};
