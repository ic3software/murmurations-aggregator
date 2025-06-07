<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const { clusters } = data;

	function formatDate(date: number): string {
		return new Date(date).toLocaleString();
	}
</script>

<svelte:head>
	<title>Murmurations Collaborative Clusters</title>
</svelte:head>

<div class="mb-8">
	<h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50">All Clusters</h2>
</div>

{#if clusters.length === 0}
	<div class="flex h-32 items-center justify-center">
		<div class="text-center">
			<p class="text-lg font-semibold text-slate-700 dark:text-slate-300">No Clusters Available</p>
			<p class="text-sm text-slate-500 dark:text-slate-400">No clusters have been created yet.</p>
		</div>
	</div>
{:else}
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each clusters as cluster}
			<div
				class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
			>
				<h2 class="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">
					{cluster.name}
				</h2>

				<p class="mb-4 text-sm text-slate-500 dark:text-slate-400">
					Last updated: {formatDate(cluster.lastUpdated * 1000)}
				</p>

				<div class="flex gap-2">
					<a
						href="/clusters/{cluster.clusterUuid}/list"
						class="flex-1 rounded-md bg-slate-900 px-3 py-2 text-center text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
					>
						List View
					</a>
					<a
						href="/clusters/{cluster.clusterUuid}/map"
						class="flex-1 rounded-md border border-slate-300 px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
					>
						Map View
					</a>
				</div>
			</div>
		{/each}
	</div>
{/if}
