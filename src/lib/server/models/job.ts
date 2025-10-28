import { jobs } from '$lib/server/db/schema';
import type { JobCreateInput } from '$lib/types/job';
import { eq } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

export async function getJobByUuid(db: DrizzleD1Database, jobUuid: string) {
	return await db.select().from(jobs).where(eq(jobs.jobUuid, jobUuid)).get();
}

export async function createJob(db: DrizzleD1Database, job: JobCreateInput) {
	return await db.insert(jobs).values(job).returning().run();
}
