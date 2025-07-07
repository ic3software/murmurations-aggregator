import { writable } from 'svelte/store';

export const isLoggedIn = writable(false);

export function initAuth() {
	if (typeof localStorage !== 'undefined') {
		const token = localStorage.getItem('login_token');
		isLoggedIn.set(token === 'true');
	}
}

export function login() {
	localStorage.setItem('login_token', 'true');
	isLoggedIn.set(true);
}

export function logout() {
	localStorage.removeItem('login_token');
	isLoggedIn.set(false);
}
