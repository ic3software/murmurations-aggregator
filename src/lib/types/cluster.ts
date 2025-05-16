export interface EditableClusterFields {
	name: string;
	centerLat: number;
	centerLon: number;
	scale: number;
}

export interface ClusterRequest extends EditableClusterFields {
	indexUrl: string;
	queryUrl: string;
}

export interface DBCluster extends ClusterRequest {
	clusterId: string;
}

export interface Cluster extends DBCluster {
	lastUpdated: number;
	createdAt: number;
	updatedAt: number;
}
