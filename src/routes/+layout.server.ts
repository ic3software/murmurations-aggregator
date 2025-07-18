import { verifyUcan, verifyUcanWithCapabilities } from '$lib/utils/ucan-utils';
import { redirect } from '@sveltejs/kit';

import type { LayoutServerLoad } from './$types';

const publicRoutes = ['/', '/login', '/register', '/profile-generator', '/batch-importer'];

export const load: LayoutServerLoad = async ({ url, locals, cookies }) => {
	const currentPath = url.pathname;

	// exlcude public routes
	if (!publicRoutes.includes(currentPath)) {
		if (!locals.user) {
			throw redirect(302, '/register');
		}

		const ucanToken = cookies.get('ucan_token');

		if (!ucanToken) {
			throw redirect(302, '/register');
		}

		const publicKey = await verifyUcan(ucanToken);

		if (!publicKey) {
			throw redirect(302, '/register');
		}

		// Process currentPath for capability verification
		const scheme = 'page';
		let hierPart = currentPath;
		let namespace = 'client';

		let pathToCheck = currentPath;
		if (currentPath.includes('/admin')) {
			namespace = 'admin';
			hierPart = currentPath.replace('/admin', '') || '/';
			pathToCheck = currentPath.replace(/^\/admin/, '') || '/';
		}

		const segments = pathToCheck.split('/').filter(Boolean);
		hierPart = '/' + (segments[0] ?? '');

		const isVerified = await verifyUcanWithCapabilities(
			ucanToken,
			publicKey,
			scheme,
			hierPart,
			namespace,
			['GET']
		);

		if (!isVerified) {
			throw redirect(302, '/');
		}
	}

	// If user is logged in, redirect to the home page if they're in login or register
	if (locals.user && (currentPath === '/login' || currentPath === '/register')) {
		throw redirect(302, '/');
	}

	return {
		user: locals.user
	};
};
