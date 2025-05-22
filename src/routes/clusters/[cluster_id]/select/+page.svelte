<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import type { Node } from '$lib/types/node';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select/index.js';
	import type { PageProps } from './$types';
	import { Label } from '$lib/components/ui/label';
	import { updateNodeStatus } from '$lib/api';
	import { toast } from 'svelte-sonner';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { Progress } from '$lib/components/ui/progress';
	import { goto } from '$app/navigation';

	let { data }: PageProps = $props();

	let nodes: Node[] = $state(data.nodes);
	let selectedIds: number[] = $state([]);
	let isSubmitting = $state(false);
	let loadingProgress = $state(0);

	const actions = [
		{ value: 'publish', label: 'Publish' },
		{ value: 'dismiss', label: 'Dismiss' },
		{ value: 'ignore', label: 'Ignore' }
	];

	let selectedAction = $state('');

	const triggerContent = $derived(
		actions.find((a) => a.value === selectedAction)?.label ?? 'Select action'
	);

	function toggleSelectAll() {
		const selectable = nodes.filter((n) => n.isAvailable && n.hasAuthority);
		if (selectedIds.length === selectable.length) {
			selectedIds = [];
		} else {
			selectedIds = selectable.map((n) => n.id);
		}
	}

	function toggleSelectRow(id: number) {
		if (selectedIds.includes(id)) {
			selectedIds = selectedIds.filter((i) => i !== id);
		} else {
			selectedIds = [...selectedIds, id];
		}
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();

		if (!selectedAction || selectedIds.length === 0) {
			toast.error('Please select an action and at least one node.');
			return;
		}

		// Scroll to the top of the page
		window.scrollTo({ top: 0, behavior: 'smooth' });

		isSubmitting = true;
		loadingProgress = 0;

		try {
			const step = 100 / selectedIds.length;
			for (let i = 0; i < selectedIds.length; i++) {
				await updateNodeStatus(data?.clusterId, selectedIds[i], selectedAction);
				loadingProgress = Math.min(100, Math.round(step * (i + 1)));
			}
			toast.success('Node statuses updated successfully.');

			await goto('/');
		} catch (error) {
			console.error('Error updating node statuses:', error);
			toast.error('Failed to update node statuses. Please try again.');
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Select Nodes | Murmurations Collaborative Map Builder</title>
</svelte:head>

<div class="min-h-screen bg-background text-foreground">
	<div class="container mx-auto px-4 py-8">
		<header class="mb-8">
			<h1 class="mb-6 text-3xl font-bold text-slate-900 dark:text-slate-50">
				Murmurations Collaborative Cluster Builder
			</h1>
		</header>

		{#if isSubmitting}
			<div class="my-6">
				<p class="mb-2 text-sm text-muted-foreground">
					Updating nodes, please wait... {loadingProgress}%
				</p>
				<Progress value={loadingProgress} max={100} class="w-full" />
			</div>
		{/if}

		<h2 class="mb-4 text-xl font-semibold">Select Nodes</h2>

		<p class="mb-6">
			Manage the nodes to display in your map or directory. You can learn more
			<a href="https://murmurations.network" class="text-primary hover:underline">in the docs</a>.
		</p>

		<div class="overflow-hidden rounded-md border">
			<div class="overflow-x-auto">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head class="w-[40px]">
								<Checkbox
									checked={nodes.length > 0 &&
										selectedIds.length ===
											nodes.filter((r) => r.isAvailable && r.hasAuthority).length}
									onCheckedChange={toggleSelectAll}
								/>
							</Table.Head>
							<Table.Head class="w-[40px]">ID</Table.Head>
							<Table.Head class="w-[40px]">📍</Table.Head>
							<Table.Head>Name / Title</Table.Head>
							<Table.Head>Profile URL</Table.Head>
							<Table.Head>Status</Table.Head>
							<Table.Head>Availability</Table.Head>
						</Table.Row>
					</Table.Header>

					<Table.Body>
						{#each nodes as node (node.id)}
							<Table.Row>
								<Table.Cell>
									<Checkbox
										checked={selectedIds.includes(node.id)}
										onCheckedChange={() => toggleSelectRow(node.id)}
										disabled={!node.isAvailable || !node.hasAuthority}
									/>
								</Table.Cell>
								<Table.Cell>{node.id}</Table.Cell>
								<Table.Cell>{JSON.parse(node.data)?.geolocation ? '📍' : ''}</Table.Cell>
								<Table.Cell>{JSON.parse(node.data)?.name || 'N/A'}</Table.Cell>
								<Table.Cell>
									<a
										href={node.profileUrl}
										target="_blank"
										rel="noreferrer"
										class="text-blue-500 underline">{node.profileUrl}</a
									>
								</Table.Cell>
								<Table.Cell class="capitalize">{node.status}</Table.Cell>
								<Table.Cell class="capitalize">
									{node.isAvailable ? 'Available' : 'Unavailable'}
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		</div>

		<div class="mt-6 flex items-center gap-4">
			<div>
				<Select.Root type="single" name="action" bind:value={selectedAction}>
					<Select.Trigger class="w-32">
						{triggerContent}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Label>Actions</Label>
							{#each actions as action (action.value)}
								<Select.Item value={action.value} label={action.label}>
									{action.label}
								</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			</div>

			{#if isSubmitting}
				<Button disabled>
					<LoaderCircle class="animate-spin" />
					Please wait
				</Button>
			{:else}
				<Button variant="default" onclick={handleSubmit}>Submit</Button>
			{/if}
			<Button variant="outline" href="/">Cancel</Button>
		</div>

		<div class="mt-4 text-sm text-muted-foreground">
			<p>Publish = display node on map</p>
			<p>Dismiss = hide node until it has updates</p>
			<p>Ignore = always hide node</p>
		</div>
	</div>
</div>
