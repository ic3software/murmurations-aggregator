import { capabilities } from '$lib/server/db/schema';
import type { CapabilityInsert } from '$lib/types/capability';
import { inArray } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

export async function getCapabilities(db: DrizzleD1Database) {
	return await db.select().from(capabilities).all();
}

export async function getCapabilitiesByIds(db: DrizzleD1Database, capabilityIds: number[]) {
	if (capabilityIds.length === 0) {
		return [];
	}

	return await db.select().from(capabilities).where(inArray(capabilities.id, capabilityIds)).all();
}

export async function createCapability(db: DrizzleD1Database, capability: CapabilityInsert) {
	return await db.insert(capabilities).values(capability).returning();
}
