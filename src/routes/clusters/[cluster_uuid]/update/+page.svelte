<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		createNode,
		deleteNode,
		getAuthorityMap,
		updateClusterTimestamp,
		updateNode,
		updateNodeStatus
	} from '$lib/api';
	import { toCamelCase } from '$lib/caseConverter';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Label } from '$lib/components/ui/label';
	import { Progress } from '$lib/components/ui/progress';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { fetchProfiles } from '$lib/profile-utils';
	import { checkProfileAuthority, processProfile } from '$lib/profile-utils';
	import type { Node, NodeUpdateInput } from '$lib/types/node';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';

	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const existingNodes = data?.nodes ?? [];
	const clusterUuid = data?.cluster?.clusterUuid;
	const indexUrl = data?.cluster?.indexUrl;
	let queryUrl = data?.cluster?.queryUrl;

	let isLoading = $state(false);
	let loadingProgress = $state(0);

	let deletedProfiles = $state<Node[]>([]);
	let unauthorizedProfiles = $state<Node[]>([]);
	let profileList = $state<Node[]>([]);

	let selectedAction = $state('');

	const actions = [
		{ value: 'publish', label: 'Publish' },
		{ value: 'dismiss', label: 'Dismiss' },
		{ value: 'ignore', label: 'Ignore' }
	];

	const triggerContent = $derived(
		actions.find((a) => a.value === selectedAction)?.label ?? 'Select action'
	);

	let selectedIds: number[] = $state([]);
	const showUnavailableColumn = $derived(
		profileList.some((n) => !n.isAvailable && n.unavailableMessage)
	);

	function toggleSelectAll() {
		const selectable = profileList.filter((n) => n.isAvailable && n.hasAuthority);
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

		isLoading = true;
		loadingProgress = 0;

		try {
			const step = 100 / selectedIds.length;
			for (let i = 0; i < selectedIds.length; i++) {
				await updateNodeStatus(clusterUuid, selectedIds[i], selectedAction);
				loadingProgress = Math.min(100, Math.round(step * (i + 1)));
			}
			toast.success('Node statuses updated successfully.');

			await goto('/');
		} catch (error) {
			console.error('Error updating node statuses:', error);
			toast.error('Failed to update node statuses. Please try again.');
		} finally {
			isLoading = false;
		}
	}

	/**
	 * Retrieve data from the index service with timestamp, which means get updated profiles only.
	 * There are 5 types of profiles:
	 * 1. new profiles - profiles that are not in the nodes table
	 * 2. updated profiles - profiles that are in the nodes table and have updates
	 * 3. unavailable profiles - profiles that unavailable in nodes table needs to check again to see if it's available now
	 * 4. deleted profiles - profiles status is marked as "deleted" in the index service
	 * 5. unauthorized profiles - if a profile's domain authority is false, and there are no other available profiles, it will be marked as unauthorized. Otherwise, unauthorized profiles should be showed in the profiles list.
	 */
	async function handleRetrieve() {
		isLoading = true;

		try {
			await fetchUpdatedProfiles();
			await checkUnavailableProfiles();
			await checkAuthorityProfiles();

			if (
				deletedProfiles.length === 0 &&
				profileList.length === 0 &&
				unauthorizedProfiles.length === 0
			) {
				toast.success('No updated profiles found.');
				await goto('/');
			}

			// If it only has deleted profiles and unauthorized profiles, update map timestamp and set `setIsMapSelected` to false and return to the map list
			if (
				(deletedProfiles.length > 0 || unauthorizedProfiles.length > 0) &&
				profileList.length === 0
			) {
				toast.success('No updated profiles found.');
			}
		} catch (err) {
			console.error(err);
			if (err instanceof Error) {
				toast.error(`Retrieve node error: ${err.message}`);
			} else {
				toast.error(`Retrieve node error: ${err}`);
			}
			await goto('/');
		} finally {
			isLoading = false;
			loadingProgress = 0;
		}
	}

	async function fetchUpdatedProfiles() {
		let currentTimestamp = Math.floor(new Date().getTime() / 1000);
		const clusterLastUpdated = data?.cluster?.lastUpdated;

		if (clusterLastUpdated) {
			queryUrl += `&last_updated=${clusterLastUpdated}`;
		} else {
			throw new Error('Cluster last updated is not set');
		}

		const rawNodes = await fetchProfiles(indexUrl, queryUrl);

		const progressStep = 33 / rawNodes.length;
		let currentProgress = 0;

		for (const profile of rawNodes) {
			currentProgress += progressStep;
			loadingProgress = Math.min(33, Math.round(currentProgress));

			if (profile.status === 'deleted') {
				const existingNode = existingNodes.find(
					(node: Node) => node.profileUrl === profile.profile_url
				);
				if (existingNode) {
					await deleteNode(clusterUuid, existingNode.id);
					deletedProfiles.push({ ...existingNode });
				}
				continue;
			}

			// Handle new and updated profiles
			const existingNode = existingNodes.find(
				(node: Node) => node.profileUrl === profile.profile_url
			);
			const shouldCreate = !existingNode;
			let existingTimestamp = new Date();
			if (existingNode) {
				existingTimestamp = new Date(existingNode.lastUpdated);
			}
			const profileTimestamp = new Date(profile.last_updated * 1000);
			const shouldUpdate = existingTimestamp.getTime() !== profileTimestamp.getTime();

			if (shouldCreate || shouldUpdate) {
				const { profile_data, status, is_available, unavailable_message } = await processProfile(
					profile,
					indexUrl
				);

				if (shouldCreate) {
					const { data: node } = await createNode(clusterUuid, {
						profileUrl: profile.profile_url,
						data: profile_data,
						status: status,
						lastUpdated: profile.last_updated,
						isAvailable: is_available ? 1 : 0,
						unavailableMessage: unavailable_message,
						hasAuthority: 1
					});
					profileList.push({ ...toCamelCase<Node>(node) });
				} else {
					const { data: updatedNode } = await updateNode(clusterUuid, existingNode.id, {
						data: profile_data,
						lastUpdated: profile.last_updated,
						status: status,
						isAvailable: is_available ? 1 : 0,
						unavailableMessage: unavailable_message
					});

					profileList.push({ ...toCamelCase<Node>(updatedNode) });
				}
			}
		}

		await updateClusterTimestamp(clusterUuid, currentTimestamp);
	}

	async function checkUnavailableProfiles() {
		const unavailableProfiles = existingNodes.filter((node: Node) => node.isAvailable === 0);

		const progressStep = 33 / unavailableProfiles.length;
		let currentProgress = 33;

		for (const profile of unavailableProfiles) {
			currentProgress += progressStep;
			loadingProgress = Math.min(66, Math.round(currentProgress));

			const { profile_data, is_available, unavailable_message } = await processProfile(
				JSON.parse(profile.data),
				indexUrl
			);

			const profileUpdatedData: NodeUpdateInput = {
				data: profile_data,
				status: profile.status,
				isAvailable: is_available ? 1 : 0,
				unavailableMessage: unavailable_message
			};

			await updateNode(clusterUuid, profile.id, profileUpdatedData);
		}
	}

	// Handle unauthorized profiles
	// Previously, we retrieve updated profiles and unavailable profiles.
	// Now, we need to check if the profiles have authority or not.
	// 1. The first step involves checking the authority status of each profile. If the authority status remains unchanged, it indicates there are no modifications required, and thus, no action will be taken.
	// 2. If the authority status changes, there are two distinct scenarios:
	// 2.1 AP to NAP: If it's in a 'publish' status, we need to move it to the unauthorized list. Updated profiles and unavailable profiles only have AP to NAP states, because default value of has_authority is TRUE. If updated profiles and unavailable profiles transition to NAP, we don't want to move them to the unauthorized list.
	// - 2.2 If a profile shifts from NAP to AP, we update the profile's background to reflect its new AP status. If users want to add this profile, they can go to 'Edit Nodes' and modify the status there.
	async function checkAuthorityProfiles() {
		const { data: authorityMap } = await getAuthorityMap(clusterUuid);

		const progressStep = 33 / (existingNodes.length + profileList.length);
		let currentProgress = 66;

		for (const profile of existingNodes) {
			currentProgress += progressStep;
			loadingProgress = Math.min(100, Math.round(currentProgress));
			const originalAuthority = profile.hasAuthority ? 1 : 0;

			const hasAuthority = checkProfileAuthority(
				authorityMap ?? [],
				JSON.parse(profile.data)?.primary_url,
				profile.profileUrl
			);

			if (originalAuthority === hasAuthority) {
				continue;
			}

			const profileUpdatedData: NodeUpdateInput = {
				data: JSON.parse(profile.data),
				status: profile.status,
				isAvailable: profile.isAvailable,
				unavailableMessage: profile.unavailableMessage,
				hasAuthority
			};

			// From AP to NAP
			if (originalAuthority === 1 && hasAuthority === 0) {
				// If a profile has no domain authority, mark it as ignored
				profileUpdatedData.status = 'ignore';

				// If a profile is not in ignore state, and isAvailable is true, add it to the unauthorizedProfiles
				if (profile.status !== 'ignore' && profile.isAvailable === 1) {
					unauthorizedProfiles.push({ ...profile });
				}
			}

			await updateNode(clusterUuid, profile.id, profileUpdatedData);
		}

		for (const profile of profileList) {
			currentProgress += progressStep;
			loadingProgress = Math.min(100, Math.round(currentProgress));

			const originalAuthority = profile.hasAuthority ? 1 : 0;

			const hasAuthority = checkProfileAuthority(
				authorityMap ?? [],
				JSON.parse(profile.data)?.primary_url,
				profile.profileUrl
			);

			if (originalAuthority === hasAuthority) {
				continue;
			}

			const profileUpdatedData: NodeUpdateInput = {
				data: JSON.parse(profile.data),
				status: profile.status,
				isAvailable: profile.isAvailable,
				unavailableMessage: profile.unavailableMessage,
				hasAuthority
			};

			await updateNode(clusterUuid, profile.id, profileUpdatedData);

			profile.hasAuthority = hasAuthority;
		}
	}

	onMount(() => {
		handleRetrieve();
	});
</script>

<svelte:head>
	<title>Update Nodes | Murmurations Collaborative Cluster Builder</title>
</svelte:head>

<div class="min-h-screen bg-background text-foreground">
	<div class="container mx-auto px-4 py-8">
		<header class="mb-8">
			<h1 class="mb-6 text-3xl font-bold text-slate-900 dark:text-slate-50">Update Nodes</h1>
		</header>

		{#if isLoading}
			<div class="my-6">
				<p class="mb-2 text-sm text-muted-foreground">
					{#if loadingProgress < 33}
						Checking for new and updated profiles... {loadingProgress}%
					{:else if loadingProgress < 66}
						Rechecking unavailable profiles... {loadingProgress}%
					{:else}
						Validating domain authority... {loadingProgress}%
					{/if}
				</p>
				<Progress value={loadingProgress} max={100} class="w-full" />
			</div>
		{/if}

		{#if deletedProfiles.length > 0}
			<h2 class="mb-4 text-xl font-semibold">Deleted Profiles</h2>
			<div class="overflow-hidden rounded-md border">
				<div class="overflow-x-auto">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head class="w-[40px]">ID</Table.Head>
								<Table.Head>Name / Title</Table.Head>
								<Table.Head>Profile URL</Table.Head>
								<Table.Head>Status</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each deletedProfiles as node (node.id)}
								<Table.Row>
									<Table.Cell>{node.id}</Table.Cell>
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
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
			</div>
		{/if}

		{#if unauthorizedProfiles.length > 0}
			<h2 class="mb-4 text-xl font-semibold">Unauthorized Profiles</h2>
			<div class="overflow-hidden rounded-md border mb-8">
				<div class="overflow-x-auto">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head class="w-[40px]">ID</Table.Head>
								<Table.Head>Name / Title</Table.Head>
								<Table.Head>Profile URL</Table.Head>
								<Table.Head>Status</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each unauthorizedProfiles as node (node.id)}
								<Table.Row>
									<Table.Cell>{node.id}</Table.Cell>
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
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
			</div>
		{/if}

		{#if deletedProfiles.length > 0 || unauthorizedProfiles.length > 0}
			<div class="mt-6 flex items-center gap-4">
				<Button variant="outline" href="/">Return to Home</Button>
			</div>
		{/if}

		{#if profileList.length > 0}
			<h2 class="mb-4 text-xl font-semibold">Updated Profiles</h2>
			<div class="overflow-hidden rounded-md border">
				<div class="overflow-x-auto">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head class="w-[40px]">
									<Checkbox
										checked={profileList.length > 0 &&
											selectedIds.length ===
												profileList.filter((r) => r.isAvailable && r.hasAuthority).length}
										onCheckedChange={toggleSelectAll}
									/>
								</Table.Head>
								<Table.Head class="w-[40px]">ID</Table.Head>
								<Table.Head class="w-[40px]">📍</Table.Head>
								<Table.Head>Name / Title</Table.Head>
								<Table.Head>Profile URL</Table.Head>
								<Table.Head>Status</Table.Head>
								<Table.Head>Availability</Table.Head>
								{#if showUnavailableColumn}
									<Table.Head>Unavailable Message</Table.Head>
								{/if}
							</Table.Row>
						</Table.Header>

						<Table.Body>
							{#each profileList as node (node.id)}
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
										{node.isAvailable === 1 ? 'Available' : 'Unavailable'}
									</Table.Cell>
									{#if showUnavailableColumn}
										<Table.Cell class="text-red-600">
											{#if !node.isAvailable && node.unavailableMessage}
												{node.unavailableMessage}
											{/if}
										</Table.Cell>
									{/if}
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

				{#if isLoading}
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
		{/if}
	</div>
</div>
