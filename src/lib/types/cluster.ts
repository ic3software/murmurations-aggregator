import { clusters } from '$lib/server/db/schema';

export type Cluster = typeof clusters.$inferSelect;

type ClusterInsert = typeof clusters.$inferInsert;

export type ClusterDbCreateInput = Omit<ClusterInsert, 'id'>;

export type ClusterCreateInput = Omit<
	ClusterInsert,
	'id' | 'clusterId' | 'createdAt' | 'updatedAt' | 'lastUpdated'
>;

export type ClusterUpdateInput = Pick<Cluster, 'name' | 'centerLat' | 'centerLon' | 'scale'>;

export type ClusterWithoutId = Omit<Cluster, 'id'>;
