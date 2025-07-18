import type { capabilities } from '$lib/server/db/schema';

export type Capability = typeof capabilities.$inferSelect;
