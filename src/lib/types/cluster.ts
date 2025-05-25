import { clusters } from '$lib/server/db/schema';

export type Cluster = typeof clusters.$inferSelect;

export type ClusterInsert = typeof clusters.$inferInsert;

export type ClusterCreateInput = Omit<
	ClusterInsert,
	'id' | 'clusterId' | 'createdAt' | 'updatedAt' | 'lastUpdated'
>;

export type ClusterUpdateInput = Pick<Cluster, 'name' | 'centerLat' | 'centerLon' | 'scale'>;

export type ClusterPublic = Omit<Cluster, 'id' | 'lastUpdated'> & {
	lastUpdated: string;
};
