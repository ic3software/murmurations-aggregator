<script lang="ts">
	import { page } from '$app/state';
	import { getUser } from '$lib/api/users';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { currentTokenStore } from '$lib/stores/token-store';
	import type { User } from '$lib/types/user';
	import { formatDate } from '$lib/utils/date';
	import { CircleAlert } from '@lucide/svelte';
	import type { Page } from '@sveltejs/kit';

	import { onMount } from 'svelte';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let currentToken: string | null = $state(null);
	let user: User | null = $state(null);
	let isInitialized = $state(false);

	// Subscribe to token changes
	currentTokenStore.subscribe(async (value) => {
		currentToken = value;
		if (value) {
			try {
				const { data: userData, success } = await getUser();
				if (success && userData) {
					user = userData;
				}
			} catch (error) {
				console.error('Failed to fetch user data:', error);
				user = null;
			}
		} else {
			user = null;
		}
	});

	interface CustomPageState extends Page {
		state: {
			message?: string;
		};
	}

	let typedPage = page as unknown as CustomPageState;

	const { clusters } = data;

	onMount(() => {
		// Wait for the layout to finish initializing
		// Use multiple requestAnimationFrame calls to
		// ensure we're after layout initialization
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				setTimeout(() => {
					isInitialized = true;
				}, 100);
			});
		});
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
		{#if currentToken}
			<Alert
				class="bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200"
			>
				<CircleAlert class="size-4" />
				<AlertTitle>Welcome{user?.name ? `, ${user.name}` : ''}! You are logged in.</AlertTitle>
			</Alert>
		{:else}
			<Alert
				class="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200"
			>
				<CircleAlert class="size-4" />
				<AlertTitle
					>You have not registered yet. <a href="/register" class="underline hover:no-underline"
						>Click here to register</a
					>.</AlertTitle
				>
				<AlertDescription
					>When you loaded this website, a <a
						href="https://en.wikipedia.org/wiki/Public-key_cryptography"
						target="_blank"
						class="text-primary hover:text-primary/80 underline">public/private key pair</a
					> was generated and stored safely in your browser. Click the link above to create an account.
					You will then be able to identify yourself here using this key pair. Logging in is automatic;
					you will be logged in as soon as the key pair is loaded.</AlertDescription
				>
			</Alert>
		{/if}
	</div>
{/if}

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
