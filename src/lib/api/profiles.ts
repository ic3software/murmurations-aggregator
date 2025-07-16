import { PUBLIC_INDEX_URL } from '$env/static/public';
import { request } from '$lib/api/request';
import type {
	Profile,
	ProfileCreateInput,
	ProfileObject,
	ProfileUpdateInput
} from '$lib/types/profile';

export const validateProfile = (profile: ProfileObject, customFetch?: typeof fetch) =>
	request<ProfileObject, undefined>(
		`${PUBLIC_INDEX_URL}/v2/validate`,
		'POST',
		profile,
		customFetch
	);

export const getIndexStatus = (nodeId: string, customFetch?: typeof fetch) =>
	request<undefined, { status: string }>(
		`${PUBLIC_INDEX_URL}/v2/nodes/${nodeId}`,
		'GET',
		undefined,
		customFetch
	);

export const postIndex = (cuid: string, customFetch?: typeof fetch) =>
	request<undefined, { node_id: string }>(
		`/api/index/nodes/${cuid}`,
		'POST',
		undefined,
		customFetch
	);

export const deleteIndex = (nodeId: string, customFetch?: typeof fetch) =>
	request<undefined, undefined>(
		`${PUBLIC_INDEX_URL}/v2/nodes/${nodeId}`,
		'DELETE',
		undefined,
		customFetch
	);

export const getProfiles = (customFetch?: typeof fetch) =>
	request<undefined, Profile[]>(`/api/profiles`, 'GET', undefined, customFetch);

export const getProfile = (cuid: string, customFetch?: typeof fetch) =>
	request<undefined, Profile>(`/api/profiles/${cuid}`, 'GET', undefined, customFetch);

export const createProfile = (profile: ProfileCreateInput, customFetch?: typeof fetch) =>
	request<ProfileCreateInput, Profile>(`/api/profiles`, 'POST', profile, customFetch);

export const updateProfile = (
	cuid: string,
	profile: ProfileUpdateInput,
	customFetch?: typeof fetch
) => request<ProfileUpdateInput, Profile>(`/api/profiles/${cuid}`, 'PATCH', profile, customFetch);

export const updateProfileNodeId = (cuid: string, nodeId: string, customFetch?: typeof fetch) =>
	request<{ node_id: string }, undefined>(
		`/api/profiles/${cuid}/update-node-id`,
		'PUT',
		{ node_id: nodeId },
		customFetch
	);

export const deleteProfile = (cuid: string, customFetch?: typeof fetch) =>
	request<undefined, undefined>(`/api/profiles/${cuid}`, 'DELETE', undefined, customFetch);
