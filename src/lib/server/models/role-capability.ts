import { roleCapabilities } from '$lib/server/db/schema';
import { eq, inArray } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

export async function getCapabilityIdsByRoleId(db: DrizzleD1Database, roleId: number) {
	const result = await db
		.select({ capabilityId: roleCapabilities.capabilityId })
		.from(roleCapabilities)
		.where(eq(roleCapabilities.roleId, roleId))
		.all();

	return result.map((row) => row.capabilityId);
}

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

export async function updateRoleCapabilities(
	db: DrizzleD1Database,
	roleId: number,
	capabilityIds: number[]
) {
	await db.delete(roleCapabilities).where(eq(roleCapabilities.roleId, roleId)).run();

	if (capabilityIds.length > 0) {
		const values = capabilityIds.map((capabilityId) => ({ roleId, capabilityId }));
		await db.insert(roleCapabilities).values(values).run();
	}
}
