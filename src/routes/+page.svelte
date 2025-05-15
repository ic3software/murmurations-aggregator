<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	const clusterData = {
		queryUrl:
			'https://test-index.murmurations.network/v2/nodes?schema=organizations_schema-v1.0.0&tags=software&tags_filter=or&tags_exact=false&page=1&page_size=500',
		shortcode:
			'[murmurations_map tag_slug="murm_b7za5jycasts1zpt4pekfrnd" height="60" width="100" view="map"]',
		mapCenter: '48.8600000, 2.3400000',
		mapScale: 6,
		createdAt: '2024-03-04 21:57:20',
		updatedAt: '2024-03-04 21:57:20'
	};
</script>

<svelte:head>
	<title>Murmurations Collaborative Cluster Builder</title>
</svelte:head>

<div class="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
	<div class="container mx-auto px-4 py-8">
		<header class="mb-8">
			<h1 class="mb-6 text-3xl font-bold text-slate-900 dark:text-slate-50">
				Murmurations Collaborative Cluster Builder
			</h1>

			<Button href="/clusters/create">Create Cluster</Button>
		</header>

		<div class="mb-6 max-w-none text-slate-700 dark:text-slate-300">
			<p class="mb-2">
				Add a shortcode into a page or post. More information about the parameters for shortcodes
				can be found
				<a
					href="https://murmurations.network"
					class="font-medium text-slate-900 hover:underline dark:text-slate-50">in the docs</a
				>.
			</p>
			<p>
				Click the <span class="font-medium">Update Nodes</span> button to check for updates to the
				nodes in that map.
				<span class="font-medium">Manage Nodes</span> enables you to change the published status of nodes
				without checking for updates.
			</p>
		</div>

		<div
			class="mb-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
		>
			<h2 class="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-50">Test</h2>

			<div class="mb-6 space-y-3">
				<div class="grid grid-cols-1 gap-2 md:grid-cols-4">
					<div class="font-medium text-slate-900 dark:text-slate-50">Query URL:</div>
					<div class="break-all text-slate-700 dark:text-slate-300 md:col-span-3">
						<a
							href={clusterData.queryUrl}
							class="text-sm text-slate-900 hover:underline dark:text-slate-50"
							>{clusterData.queryUrl}</a
						>
					</div>
				</div>

				<div class="grid grid-cols-1 gap-2 md:grid-cols-4">
					<div class="font-medium text-slate-900 dark:text-slate-50">Shortcode:</div>
					<div class="break-all text-slate-700 dark:text-slate-300 md:col-span-3">
						<code class="rounded bg-slate-100 px-1.5 py-0.5 text-sm dark:bg-slate-800"
							>{clusterData.shortcode}</code
						>
					</div>
				</div>

				<div class="grid grid-cols-1 gap-2 md:grid-cols-4">
					<div class="font-medium text-slate-900 dark:text-slate-50">Map Center:</div>
					<div class="text-slate-700 dark:text-slate-300 md:col-span-3">
						{clusterData.mapCenter}
					</div>
				</div>

				<div class="grid grid-cols-1 gap-2 md:grid-cols-4">
					<div class="font-medium text-slate-900 dark:text-slate-50">Map Scale:</div>
					<div class="text-slate-700 dark:text-slate-300 md:col-span-3">{clusterData.mapScale}</div>
				</div>

				<div class="grid grid-cols-1 gap-2 md:grid-cols-4">
					<div class="font-medium text-slate-900 dark:text-slate-50">Created At:</div>
					<div class="text-slate-700 dark:text-slate-300 md:col-span-3">
						{clusterData.createdAt}
					</div>
				</div>

				<div class="grid grid-cols-1 gap-2 md:grid-cols-4">
					<div class="font-medium text-slate-900 dark:text-slate-50">Updated At:</div>
					<div class="text-slate-700 dark:text-slate-300 md:col-span-3">
						{clusterData.updatedAt}
					</div>
				</div>
			</div>

			<div class="flex flex-wrap gap-3">
				<Button>Update Nodes</Button>
				<Button>Manage Nodes</Button>
				<Button variant="secondary">Edit Cluster</Button>
				<Button variant="destructive">Delete Cluster</Button>
			</div>
		</div>
	</div>
</div>
