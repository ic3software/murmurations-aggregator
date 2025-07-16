import { writable } from 'svelte/store';

export const isLoggedIn = writable(false);

export function initAuth() {
	if (typeof localStorage !== 'undefined') {
		const token = localStorage.getItem('ucan_token');
		isLoggedIn.set(token !== null && token !== undefined);
	}
}

export function login(token: string) {
	localStorage.setItem('ucan_token', token);
	isLoggedIn.set(true);
}

export function logout() {
	localStorage.removeItem('ucan_token');
	isLoggedIn.set(false);
}
