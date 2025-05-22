import { nodes } from '$lib/server/db/schema';
import type { ProfileData } from '$lib/types/profile';

export type Node = typeof nodes.$inferSelect;

type NodeInsert = typeof nodes.$inferInsert;

export type NodeDbCreateInput = Omit<NodeInsert, 'id'>;

export type NodeCreateInput = Omit<
	NodeInsert,
	'id' | 'createdAt' | 'updatedAt' | 'clusterUuid' | 'data'
> & {
	data: ProfileData;
};

export type NodeUpdateInput = Omit<
	NodeInsert,
	'id' | 'createdAt' | 'updatedAt' | 'clusterUuid' | 'data' | 'profileUrl'
> & {
	data: ProfileData;
};

export type NodeDbUpdateInput = Pick<
	Node,
	'data' | 'status' | 'lastUpdated' | 'isAvailable' | 'unavailableMessage' | 'hasAuthority'
>;

export type NodeInput = Omit<Node, 'createdAt' | 'updatedAt' | 'clusterUuid' | 'data'> & {
	data: ProfileData;
};
