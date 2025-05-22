<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';
	import type { Node, NodeInput, NodeUpdateInput } from '$lib/types/node';
	import { fetchProfiles } from '$lib/profile-utils';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import {
		deleteNode,
		updateNode,
		getAuthorityMap,
		createNode,
		updateClusterTimestamp
	} from '$lib/api';
	import { processProfile, checkProfileAuthority } from '$lib/profile-utils';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Table from '$lib/components/ui/table/index.js';

	let { data }: PageProps = $props();

	const existingNodes = data?.nodes ?? [];
	const clusterId = data?.cluster?.clusterId;
	const indexUrl = data?.cluster?.indexUrl;
	let queryUrl = data?.cluster?.queryUrl;

	let isLoading = $state(false);
	let loadingProgress = $state(0);

	let deletedProfiles = $state<NodeInput[]>([]);
	let unauthorizedProfiles = $state<NodeInput[]>([]);
	let profileList = $state<NodeInput[]>([]);

	let selectedAction = $state('');

	const actions = [
		{ value: 'publish', label: 'Publish' },
		{ value: 'dismiss', label: 'Dismiss' },
		{ value: 'ignore', label: 'Ignore' }
	];

	const triggerContent = $derived(
		actions.find((a) => a.value === selectedAction)?.label ?? 'Select action'
	);

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

		let currentTimestamp = new Date();

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
				await updateClusterTimestamp(clusterId, currentTimestamp);
				toast.success('No updated profiles found.');
			}
		} catch (err) {
			console.error(err);
			if (err instanceof Error) {
				toast.error(`Retrieve node error: ${err.message}`);
			} else {
				toast.error(`Retrieve node error: ${err}`);
			}
		} finally {
			isLoading = false;
			loadingProgress = 0;
		}
	}

	async function fetchUpdatedProfiles() {
		const clusterLastUpdated = data?.cluster?.lastUpdated;
		if (clusterLastUpdated) {
			queryUrl += `&last_updated=${clusterLastUpdated}`;
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
					await deleteNode(clusterId, existingNode.id);
					deletedProfiles.push(existingNode);
				}
				continue;
			}

			// Handle new and updated profiles
			const existingNode = existingNodes.find(
				(node: Node) => node.profileUrl === profile.profile_url
			);
			const shouldCreate = !existingNode;
			const shouldUpdate = existingNode?.lastUpdated !== profile.last_updated.toString();

			if (shouldCreate || shouldUpdate) {
				const { profile_data, status, is_available, unavailable_message } = await processProfile(
					profile,
					indexUrl
				);

				if (shouldCreate) {
					const { id } = await createNode(clusterId, {
						profileUrl: profile.profile_url,
						data: profile_data,
						status: status,
						lastUpdated: profile.last_updated,
						isAvailable: is_available ? 1 : 0,
						unavailableMessage: unavailable_message,
						hasAuthority: 1
					});
					profileList.push({
						id,
						profileUrl: profile.profile_url,
						data: profile_data,
						status: status,
						lastUpdated: profile.last_updated,
						isAvailable: is_available ? 1 : 0,
						unavailableMessage: unavailable_message,
						hasAuthority: 1
					});
				} else {
					await updateNode(clusterId, existingNode.id, {
						data: profile_data,
						status: status,
						isAvailable: is_available ? 1 : 0,
						unavailableMessage: unavailable_message
					});

					profileList.push({
						id: existingNode.id,
						profileUrl: existingNode.profileUrl,
						data: profile_data,
						status,
						isAvailable: is_available ? 1 : 0,
						lastUpdated: profile.last_updated,
						unavailableMessage: unavailable_message,
						hasAuthority: 1
					});
				}
			}
		}
	}

	async function checkUnavailableProfiles() {
		const unavailableProfiles = existingNodes.filter((node: Node) => node.isAvailable === 0);

		const progressStep = 33 / unavailableProfiles.length;
		let currentProgress = 33;

		for (const profile of unavailableProfiles) {
			currentProgress += progressStep;
			loadingProgress = Math.min(66, Math.round(currentProgress));

			const { profile_data, is_available, unavailable_message } = await processProfile(
				profile.data,
				indexUrl
			);

			const profileObject: NodeUpdateInput = {
				data: profile_data,
				status: profile.status,
				isAvailable: is_available ? 1 : 0,
				unavailableMessage: unavailable_message
			};

			await updateNode(clusterId, profile.id, profileObject);
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
		const authorityMap = await getAuthorityMap(clusterId);

		const progressStep = 33 / existingNodes.length;
		let currentProgress = 66;

		for (const profile of existingNodes) {
			currentProgress += progressStep;
			loadingProgress = Math.min(100, Math.round(currentProgress));
			const originalAuthority = profile.hasAuthority ? 1 : 0;

			const hasAuthority = checkProfileAuthority(
				authorityMap,
				profile.data.primary_url,
				profile.profileUrl
			);

			if (originalAuthority === hasAuthority) {
				continue;
			}

			const profileObject: NodeUpdateInput = {
				data: profile.data,
				status: profile.status,
				isAvailable: profile.isAvailable,
				unavailableMessage: profile.unavailableMessage,
				hasAuthority
			};

			// From AP to NAP
			if (originalAuthority === 1 && hasAuthority === 0) {
				// If a profile has no domain authority, mark it as ignored
				profileObject.status = 'ignore';

				// If a profile is not in ignore state, and isAvailable is true, add it to the unauthorizedProfiles
				if (profile.status !== 'ignore' && profile.isAvailable === 1) {
					unauthorizedProfiles.push({
						id: profile.id,
						profileUrl: profile.profileUrl,
						data: profile.data,
						status: profile.status,
						isAvailable: profile.isAvailable,
						unavailableMessage: profile.unavailableMessage,
						hasAuthority: 0,
						lastUpdated: profile.lastUpdated
					});
				}
			}

			await updateNode(clusterId, profile.id, profileObject);
		}
	}

	onMount(() => {
		handleRetrieve();
	});
</script>

<svelte:head>
	<title>Update Nodes | Murmurations Collaborative Cluster Builder</title>
</svelte:head>

<div>
	{#if isLoading}
		<p>
			{#if loadingProgress < 33}
				Checking for new and updated profiles...
			{:else if loadingProgress < 66}
				Rechecking unavailable profiles...
			{:else}
				Validating domain authority...
			{/if}
		</p>
	{/if}
	<progress value={loadingProgress} max="100"></progress>

	{#if !isLoading}
		<h2>Deleted Profiles</h2>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>ID</Table.Head>
					<Table.Head>Profile URL</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each deletedProfiles as profile}
					<Table.Row>
						<Table.Cell>{profile.id}</Table.Cell>
						<Table.Cell>{profile.profileUrl}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>

		<h2>Unauthorized Profiles</h2>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>ID</Table.Head>
					<Table.Head>Profile URL</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each unauthorizedProfiles as profile}
					<Table.Row>
						<Table.Cell>{profile.id}</Table.Cell>
						<Table.Cell>{profile.profileUrl}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>

		<h2>Profile List</h2>
		<ul>
			{#each profileList as profile}
				<li>{profile.profileUrl}</li>
			{/each}
		</ul>

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

			<Button variant="default" onclick={() => console.log('Submit action:', selectedAction)}>
				Submit
			</Button>
		</div>
	{/if}
</div>
