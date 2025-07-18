import { request } from '$lib/api/request';
import type { Role } from '$lib/types/role';

export const getRoles = (customFetch?: typeof fetch) =>
	request<undefined, Role[]>('/api/admin/roles', 'GET', undefined, customFetch);
