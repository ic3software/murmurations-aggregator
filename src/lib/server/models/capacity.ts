import { capabilities } from '$lib/server/db/schema';
import { inArray } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

export async function getCapabilitiesByIds(db: DrizzleD1Database, capabilityIds: number[]) {
	if (capabilityIds.length === 0) {
		return [];
	}

	return await db.select().from(capabilities).where(inArray(capabilities.id, capabilityIds)).all();
}
