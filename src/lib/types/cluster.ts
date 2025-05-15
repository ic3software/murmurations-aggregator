export interface ClusterRequest {
	name: string;
	indexUrl: string;
	queryUrl: string;
	centerLat: number;
	centerLon: number;
	scale: number;
}

export interface DBCluster extends ClusterRequest {
	clusterId: string;
}

export interface Cluster extends DBCluster {
	lastUpdated: number;
	createdAt: number;
	updatedAt: number;
}
