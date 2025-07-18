import { request } from '$lib/api/request';
import type { Capability } from '$lib/types/capability';

export const getCapabilities = (customFetch?: typeof fetch) =>
	request<undefined, Capability[]>('/api/admin/capabilities', 'GET', undefined, customFetch);
