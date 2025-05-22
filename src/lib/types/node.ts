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

export type NodeUpdateInput = Pick<
	Node,
	'profileUrl' | 'status' | 'isAvailable' | 'unavailableMessage' | 'hasAuthority'
>;

export type NodeWithoutId = Omit<Node, 'id'>;
