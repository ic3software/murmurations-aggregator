<script lang="ts">
	import { Map, MarkerCluster, TileLayer } from '$lib/svelte-leaflet';
	import type { MapNode } from '$lib/types/node';
	import L, { MarkerClusterGroup } from 'leaflet';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const cluster = data.cluster;
	const nodes: MapNode[] = data.nodes ?? [];
	let clusterInstance: MarkerClusterGroup | undefined = $state();

	function createPopupContent(node: MapNode): string {
		let content = `<div class="min-w-[200px] font-sans break-words">`;

		if (node.primaryUrl && node.primaryUrl.trim()) {
			content += `<div class="mb-2">
			<strong>URL:</strong>
			<a href="${node.primaryUrl}" target="_blank" rel="noopener noreferrer" 
			   class="text-blue-700 underline break-words">
				${node.primaryUrl}
			</a>
		</div>`;
		}

		if (node.id) {
			content += `<div class="mb-2">
			<strong>Source:</strong>
			<a href="/clusters/${cluster.clusterUuid}/nodes/${node.id}" target="_blank" rel="noopener noreferrer" 
			   class="text-blue-700 underline break-words">
				Click to view node details
			</a>
		</div>`;
		}

		content += `</div>`;
		return content;
	}

	$effect(() => {
		if (clusterInstance && nodes?.length) {
			clusterInstance.clearLayers();

			nodes.forEach((node) => {
				const marker = L.marker([node.lat, node.lon], {
					title: String(node.id)
				}).bindPopup(createPopupContent(node));
				clusterInstance?.addLayer(marker);
			});
		}
	});
</script>

<div class="w-full h-screen">
	<Map
		options={{
			center: [cluster?.centerLat ?? 46.603354, cluster?.centerLon ?? 1.888334],
			zoom: cluster?.scale ?? 6
		}}
	>
		<TileLayer url={'https://tile.openstreetmap.org/{z}/{x}/{y}.png'} />
		<MarkerCluster bind:instance={clusterInstance} />
	</Map>
</div>
