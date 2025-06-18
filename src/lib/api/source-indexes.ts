import { request } from '$lib/api/request';
import type { SourceIndex } from '$lib/types/source-index';

export const getSourceIndexes = async (customFetch?: typeof fetch) =>
	request<undefined, SourceIndex[]>('/api/source-indexes', 'GET', undefined, customFetch);
