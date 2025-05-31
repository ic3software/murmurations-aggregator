<script lang="ts">
	import { goto } from '$app/navigation';
	import { updateCluster } from '$lib/api';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';

	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let clusterName = $state(data?.cluster?.name ?? '');
	let clusterCenterLatitude = $state(data?.cluster?.centerLat ?? 0);
	let clusterCenterLongitude = $state(data?.cluster?.centerLon ?? 0);
	let clusterScale = $state(data?.cluster?.scale ?? 5);

	let isUpdatingCluster = $state(false);

	async function submitEdit(event: Event) {
		event.preventDefault();

		isUpdatingCluster = true;

		try {
			const updatedCluster = {
				name: clusterName,
				centerLat: clusterCenterLatitude,
				centerLon: clusterCenterLongitude,
				scale: clusterScale
			};

			const response = await updateCluster(data?.cluster?.clusterUuid ?? '', updatedCluster);

			if (response?.success) {
				toast.success('Cluster updated successfully');
				goto('/');
			} else {
				toast.error('Error updating cluster');
			}
		} catch (error) {
			console.error('Error updating cluster:', error);
			toast.error('Error updating cluster');
		} finally {
			isUpdatingCluster = false;
		}
	}

	onMount(() => {
		if (data?.cluster === null) {
			toast.error('Cluster not found. Please try again.');
			goto('/');
		}
	});
</script>

<svelte:head>
	<title>Edit Cluster | Murmurations Collaborative Cluster Builder</title>
</svelte:head>

<div class="min-h-screen bg-background text-foreground">
	<div class="container mx-auto px-4 py-8">
		<header class="mb-8">
			<h1 class="mb-6 text-3xl font-bold text-slate-900 dark:text-slate-50">
				Murmurations Collaborative Cluster Builder
			</h1>
		</header>

		<div class="mx-auto max-w-none">
			<h2 class="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-50">Edit Cluster</h2>

			<form class="space-y-8" onsubmit={submitEdit}>
				<div class="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
					<div class="flex flex-col space-y-1.5 p-0">
						<h3 class="text-2xl font-semibold leading-none tracking-tight">Cluster Settings</h3>
					</div>
					<div class="p-0 pt-4">
						<div class="grid gap-4">
							<div class="grid gap-2">
								<Label for="cluster-name">Cluster Name</Label>
								<Input
									type="text"
									id="cluster-name"
									bind:value={clusterName}
									class="w-full"
									placeholder="Enter cluster name"
								/>
								<p class="text-sm text-muted-foreground">
									A familiar name to make it easy for you to identify
								</p>
							</div>

							<p class="leading-7">
								Use <a
									href="https://latlong.net"
									target="_blank"
									class="font-medium text-primary underline underline-offset-4">LatLong.net</a
								> to pick a location, enter coordinates with decimals (e.g., 48.86124)
							</p>

							<div class="grid gap-2">
								<Label for="cluster-center-latitude">Cluster Center Latitude</Label>
								<Input
									type="number"
									min="-90"
									max="90"
									step="0.000001"
									id="cluster-center-latitude"
									bind:value={clusterCenterLatitude}
									class="w-full"
									placeholder="Enter latitude"
								/>
							</div>

							<div class="grid gap-2">
								<Label for="cluster-center-longitude">Cluster Center Longitude</Label>
								<Input
									type="number"
									min="-180"
									max="180"
									step="0.000001"
									id="cluster-center-longitude"
									bind:value={clusterCenterLongitude}
									class="w-full"
									placeholder="Enter longitude"
								/>
							</div>

							<div class="grid gap-2">
								<Label for="cluster-scale">Cluster Scale</Label>
								<Input
									type="number"
									min="1"
									max="18"
									step="1"
									id="cluster-scale"
									bind:value={clusterScale}
									class="w-full"
									placeholder="Enter cluster scale"
								/>
								<p class="text-sm text-muted-foreground">
									1 = the entire globe, 18 = maximum zoom in
								</p>
							</div>
						</div>
					</div>
				</div>

				<div class="flex gap-4">
					{#if isUpdatingCluster}
						<Button disabled>
							<LoaderCircle class="animate-spin" />
							Please wait
						</Button>
					{:else}
						<Button type="submit">Submit</Button>
					{/if}
					<Button variant="secondary" href="/">Cancel</Button>
				</div>
			</form>
		</div>
	</div>
</div>
