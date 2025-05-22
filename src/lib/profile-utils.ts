import type { ProfileData } from '$lib/types/profile';

export async function fetchProfileData(profileUrl: string) {
	let profileData: ProfileData = {};
	let fetchProfileError: string | null = null;

	if (profileUrl) {
		try {
			const response = await fetch(profileUrl);
			if (response.ok) {
				profileData = await response.json();
			} else {
				fetchProfileError = 'STATUS-' + response.status;
			}
		} catch (err) {
			console.error('Error fetching profile data:', err);
			if (err instanceof Error && err.message === 'Failed to fetch') {
				fetchProfileError = 'CORS';
			} else {
				fetchProfileError = 'UNKNOWN';
			}
		}
	}

	return { profileData, fetchProfileError };
}

export async function validateProfileData(profileData: ProfileData, dataUrl: string) {
	try {
		const url = new URL(dataUrl);
		const response = await fetch(`${url.origin}/v2/validate`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(profileData)
		});
		return response.ok;
	} catch (err) {
		console.error('Error validating profile data:', err);
		return false;
	}
}
