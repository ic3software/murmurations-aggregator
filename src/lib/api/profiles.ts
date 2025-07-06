import { PUBLIC_INDEX_URL } from '$env/static/public';
import { request } from '$lib/api/request';
import type { Profile, ProfileData, ProfileUpdateInput, ValidationError } from '$lib/types/profile';

export const validateProfile = (profile: ProfileData, customFetch?: typeof fetch) =>
	request<ProfileData, { meta: { message: string } } | ValidationError[]>(
		`${PUBLIC_INDEX_URL}/v2/validate`,
		'POST',
		profile,
		customFetch
	);

export const getProfiles = (customFetch?: typeof fetch) =>
	request<undefined, Profile[]>(`/api/profiles`, 'GET', undefined, customFetch);

export const getProfile = (cuid: string, customFetch?: typeof fetch) =>
	request<undefined, Profile>(`/api/profiles/${cuid}`, 'GET', undefined, customFetch);

export const updateProfile = (
	cuid: string,
	profile: ProfileUpdateInput,
	customFetch?: typeof fetch
) => request<ProfileUpdateInput, undefined>(`/api/profiles/${cuid}`, 'PATCH', profile, customFetch);
