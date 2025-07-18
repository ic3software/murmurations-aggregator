import { capabilities } from '$lib/server/db/schema';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

export async function getCapabilities(db: DrizzleD1Database) {
	return await db.select().from(capabilities).all();
}
