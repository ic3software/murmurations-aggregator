import type { roles } from '$lib/server/db/schema';

export type Role = typeof roles.$inferSelect;
