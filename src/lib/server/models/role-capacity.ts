import { roleCapabilities } from '$lib/server/db/schema';
import { inArray } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

export async function getCapabilityIdsByRoleIds(db: DrizzleD1Database, roleIds: number[]) {
	if (roleIds.length === 0) {
		return [];
	}

	const result = await db
		.select({ capabilityId: roleCapabilities.capabilityId })
		.from(roleCapabilities)
		.where(inArray(roleCapabilities.roleId, roleIds))
		.all();

	const uniqueCapabilityIds = [...new Set(result.map((row) => row.capabilityId))];
	return uniqueCapabilityIds;
}
