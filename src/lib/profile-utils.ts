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

export async function fetchProfiles(indexUrl: string, queryUrl: string) {
	const fullUrl = `${indexUrl}${queryUrl}`;
	const response = await fetch(fullUrl);

	if (!response.ok) {
		throw new Error('Failed to fetch nodes');
	}

	const data = await response.json();

	return data?.data ?? [];
}

export async function processProfile(profile: ProfileData, sourceIndex: string) {
	const { profileData, fetchProfileError } = await fetchProfileData(profile.profile_url as string);
	const isValid = profileData && (await validateProfileData(profileData, sourceIndex));

	return {
		profile_data: profileData,
		is_available: !!profileData && isValid,
		status: !profileData || !isValid ? 'ignore' : 'new',
		unavailable_message: !profileData ? fetchProfileError : !isValid ? 'Invalid Profile Data' : ''
	};
}

export function checkProfileAuthority(
	authorityMap: string[],
	originPrimaryUrl: string,
	originProfileUrl: string
) {
	try {
		if (originPrimaryUrl === 'https://') {
			console.log('Invalid URL');
			return 1;
		}

		const primaryUrl = new URL(addDefaultScheme(originPrimaryUrl));
		const profileUrl = new URL(addDefaultScheme(originProfileUrl));

		if (!primaryUrl.protocol.startsWith('http') || !profileUrl.protocol.startsWith('http')) {
			console.log('Invalid protocol');
			return 1;
		}

		// If the primary URL is in the authority map, it means that the primary URL has other profiles that have authority, so if the profile URL is not the same as the primary URL, it does not have authority
		if (authorityMap.includes(primaryUrl.hostname) && primaryUrl.hostname !== profileUrl.hostname) {
			return 0;
		}

		return 1;
	} catch (e) {
		console.log(e);
		return 1;
	}
}

function addDefaultScheme(url: string) {
	if (url !== undefined && !url?.startsWith('http://') && !url?.startsWith('https://')) {
		return 'https://' + url;
	}
	return url;
}
