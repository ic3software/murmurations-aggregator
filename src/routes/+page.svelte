<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { PageProps } from './$types';
	import { formatDate } from '$lib/date';
	import { deleteCluster } from '$lib/api';
	import { toast } from 'svelte-sonner';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { buttonVariants } from '$lib/components/ui/button';

	let { data }: PageProps = $props();

	let clusters = $state(data?.clusters ?? []);

	async function handleDeleteCluster(clusterId: string) {
		try {
			await deleteCluster(clusterId);
			clusters = clusters.filter((cluster) => cluster.clusterId !== clusterId);
			toast.success('Cluster deleted successfully');
		} catch (error) {
			toast.error(`Failed to delete cluster: ${error}`);
		}
	}
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

		{#if clusters.length === 0}
			<div class="flex h-32 items-center justify-center">
				<div class="text-center">
					<p class="text-lg font-semibold text-slate-700 dark:text-slate-300">
						No Clusters Available
					</p>
					<p class="text-sm text-slate-500 dark:text-slate-400">
						Please create a new cluster to get started.
					</p>
				</div>
			</div>
		{:else}
			{#each clusters as cluster}
				<div
					class="mb-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
				>
					<h2 class="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-50">
						{cluster.name}
					</h2>

					<div class="mb-6 space-y-3">
						<div class="grid grid-cols-1 gap-2 md:grid-cols-4">
							<div class="font-medium text-slate-900 dark:text-slate-50">Query URL:</div>
							<div class="break-all text-slate-700 dark:text-slate-300 md:col-span-3">
								<a
									href={`${cluster.indexUrl}${cluster.queryUrl}`}
									class="text-sm text-slate-900 hover:underline dark:text-slate-50"
									>{`${cluster.indexUrl}${cluster.queryUrl}`}</a
								>
							</div>
						</div>

						<div class="grid grid-cols-1 gap-2 md:grid-cols-4">
							<div class="font-medium text-slate-900 dark:text-slate-50">Map Center:</div>
							<div class="text-slate-700 dark:text-slate-300 md:col-span-3">
								{cluster.centerLat}, {cluster.centerLon}
							</div>
						</div>

						<div class="grid grid-cols-1 gap-2 md:grid-cols-4">
							<div class="font-medium text-slate-900 dark:text-slate-50">Map Scale:</div>
							<div class="text-slate-700 dark:text-slate-300 md:col-span-3">{cluster.scale}</div>
						</div>

						<div class="grid grid-cols-1 gap-2 md:grid-cols-4">
							<div class="font-medium text-slate-900 dark:text-slate-50">Created At:</div>
							<div class="text-slate-700 dark:text-slate-300 md:col-span-3">
								{formatDate(cluster.createdAt)}
							</div>
						</div>

						<div class="grid grid-cols-1 gap-2 md:grid-cols-4">
							<div class="font-medium text-slate-900 dark:text-slate-50">Updated At:</div>
							<div class="text-slate-700 dark:text-slate-300 md:col-span-3">
								{formatDate(cluster.updatedAt)}
							</div>
						</div>
					</div>

					<div class="flex flex-wrap gap-3">
						<Button href={`/clusters/${cluster.clusterId}/update`}>Update Nodes</Button>
						<Button href={`/clusters/${cluster.clusterId}/select`}>Manage Nodes</Button>
						<Button variant="secondary" href={`/clusters/${cluster.clusterId}/edit`}
							>Edit Cluster</Button
						>
						<AlertDialog.Root>
							<AlertDialog.Trigger class={buttonVariants({ variant: 'destructive' })}>
								Delete Cluster
							</AlertDialog.Trigger>
							<AlertDialog.Content>
								<AlertDialog.Header>
									<AlertDialog.Title>Delete Cluster</AlertDialog.Title>
								</AlertDialog.Header>
								<AlertDialog.Description>
									<p>
										Are you sure you want to delete the cluster: {cluster.name}?
									</p>
								</AlertDialog.Description>
								<AlertDialog.Footer>
									<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
									<AlertDialog.Action onclick={() => handleDeleteCluster(cluster.clusterId)}>
										Continue
									</AlertDialog.Action>
								</AlertDialog.Footer>
							</AlertDialog.Content>
						</AlertDialog.Root>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>
