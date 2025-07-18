import { roles } from '$lib/server/db/schema';
import { inArray } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

export async function getRoles(db: DrizzleD1Database) {
	return await db.select().from(roles).all();
}

export async function checkRoleIdsExist(
	db: DrizzleD1Database,
	roleIds: number[]
): Promise<boolean> {
	if (roleIds.length === 0) {
		return true;
	}

	const result = await db
		.select({ id: roles.id })
		.from(roles)
		.where(inArray(roles.id, roleIds))
		.all();

	return result.length === roleIds.length;
}
