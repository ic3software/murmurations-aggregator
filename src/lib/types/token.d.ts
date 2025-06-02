import type { loginTokens } from '$lib/server/db/schema';

export type LoginToken = typeof loginTokens.$inferSelect;
