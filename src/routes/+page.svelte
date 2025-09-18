<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { getUser } from '$lib/api/users';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { getToken } from '$lib/core';
	import { currentTokenStore } from '$lib/stores/token-store';
	import type { User } from '$lib/types/user';
	import { formatDate } from '$lib/utils/date';
	import { CircleAlert } from '@lucide/svelte';
	import type { Page } from '@sveltejs/kit';

	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let currentToken: string | null = $state(null);
	let user: User | null = $state(null);
	let isInitialized = $state(false);

	async function updateUserData(token: string | null) {
		currentToken = token;
		if (!token) {
			user = null;
			return;
		}

		try {
			const { data: userData, success } = await getUser();
			if (success && userData) {
				user = userData;
			}
		} catch (error) {
			console.error('Failed to fetch user data:', error);
			user = null;
		}
	}

	interface CustomPageState extends Page {
		state: {
			message?: string;
		};
	}

	let typedPage = page as unknown as CustomPageState;

	const { clusters } = data;

	onMount(() => {
		const unsubscribe = currentTokenStore.subscribe(async (value) => {
			await updateUserData(value);
		});

		if (browser) {
			getToken('currentToken')
				.then(async (storedToken) => {
					if (storedToken) {
						await updateUserData(storedToken);
					}
				})
				.catch((error) => {
					console.error('Failed to get token from IndexedDB:', error);
				});
		}

		setTimeout(() => {
			const token = get(currentTokenStore);
			if (token && !currentToken) {
				updateUserData(token);
			}
		}, 100);

		setTimeout(() => {
			isInitialized = true;
		}, 200);

		return unsubscribe;
	});
</script>

{#if typedPage?.state?.message}
	<Alert class="mb-6">
		<CircleAlert class="size-4" />
		<AlertTitle>
			{typedPage.state.message}
		</AlertTitle>
	</Alert>
{/if}

{#if isInitialized}
	<div class="mb-6">
		<Alert
			class={currentToken
				? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200'
				: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200'}
		>
			{#if currentToken}
				<AlertTitle>Welcome{user?.name ? `, ${user.name}` : ''}!</AlertTitle>
			{:else}
				<AlertTitle
					>You have not registered yet. <a href="/register" class="underline hover:no-underline"
						>Click here to register</a
					>.</AlertTitle
				>
			{/if}
			<AlertDescription>
				<Accordion.Root type="single">
					<Accordion.Item value="item-1">
						<Accordion.Trigger>What is MurmurMaps?</Accordion.Trigger>
						<Accordion.Content>
							With MurmurMaps you can:
							<ul class="list-disc list-inside">
								<li class="mt-2">
									Curate clusters of open, decentralized data from the Murmurations index as maps or
									directories
								</li>
								<li>
									Create and manage your own open data sets for inclusion in the Murmurations index
								</li>
								<li>Explore the data in the Murmurations index</li>
							</ul>
						</Accordion.Content>
					</Accordion.Item>
				</Accordion.Root>
			</AlertDescription>
		</Alert>
	</div>
{/if}

{#if clusters.length === 0}
	<div class="flex h-32 items-center justify-center">
		<div class="text-center">
			<p class="text-lg font-semibold text-slate-700 dark:text-slate-300">No Clusters Available</p>
			<p class="text-sm text-slate-500 dark:text-slate-400">No clusters have been created yet.</p>
		</div>
	</div>
{:else}
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each clusters as cluster (cluster.clusterUuid)}
			<div
				class="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900"
			>
				<h2 class="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">
					{cluster.name}
				</h2>

				<p class="mb-4 text-sm text-slate-500 dark:text-slate-400">
					Last updated: {formatDate(cluster.lastUpdated)}
				</p>

				<div class="flex gap-2">
					<a
						href="/clusters/{cluster.clusterUuid}/list"
						class="flex-1 rounded-md bg-slate-900 px-3 py-2 text-center text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
					>
						Directory
					</a>
					<a
						href="/clusters/{cluster.clusterUuid}/map"
						class="flex-1 rounded-md bg-slate-900 px-3 py-2 text-center text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
					>
						Map
					</a>
				</div>
			</div>
		{/each}
	</div>
{/if}
