import { getLibrarySchemas } from '$lib/api/schemas';
import type { BasicSchema } from '$lib/types/schema';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const { data: schemas, error } = await getLibrarySchemas(fetch);
	const schemasList = schemas
		.filter((s: BasicSchema) => {
			return !s.name.startsWith('default-v');
		})
		.filter((s: BasicSchema) => {
			return !s.name.startsWith('test_schema-v');
		});

	return { schemasList, errorMessage: error };
};
