import { userRoles } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

export async function getRoleIdsByUserId(db: DrizzleD1Database, userId: number) {
	const result = await db
		.select({ roleId: userRoles.roleId })
		.from(userRoles)
		.where(eq(userRoles.userId, userId))
		.all();

	return result.map((row) => row.roleId);
}
