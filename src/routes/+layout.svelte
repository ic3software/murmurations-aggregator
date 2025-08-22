<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { refreshToken } from '$lib/api/auth-request';
	import { Menubar, MenubarMenu, MenubarTrigger } from '$lib/components/ui/menubar';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Toaster } from '$lib/components/ui/sonner';
	import { getDelegations, getToken, storeDelegations, storeToken } from '$lib/core';
	import { exportPublicKey, getOrCreateKeyPair, signRequest } from '$lib/crypto';
	import { dbStatus } from '$lib/stores/db-status';
	import {
		currentTokenStore,
		delegationsStore,
		rootTokenStore,
		selectedDelegationStore
	} from '$lib/stores/token-store';
	import type { CryptoKeyPair } from '$lib/types/crypto';
	import type { Delegation } from '$lib/types/delegation';
	import { checkDbStatus } from '$lib/utils/check-db-status';
	import {
		issueAccessUcan,
		isUcanExpired,
		verifyUcanWithCapabilities
	} from '$lib/utils/ucan-utils';
	import { AlertCircle, Clock, User, WifiOff } from '@lucide/svelte';

	import { onMount } from 'svelte';

	import '../app.css';

	let { children } = $props();

	let isDbOnline: boolean = $state(true);
	let isOnline: boolean = $state(true);

	const siteName = 'Murmurations Collaborative Cluster';
	const isAdminRoute = $derived(page.url.pathname.startsWith('/admin'));

	// Define routes that do not require DB status check
	const routesWithDbCheck = ['/profile-generator', '/batch-importer'];

	// Subscribe to dbStatus only if the route requires it
	if (routesWithDbCheck.includes(page.url.pathname)) {
		dbStatus.subscribe((value) => {
			isDbOnline = value;
		});
	}

	const hiddenRoutes = ['/login', '/register'];
	const showMenubar = $derived(!hiddenRoutes.includes(page.url.pathname));

	// Subscribe to stores
	let rootToken: string | null = $state(null);
	let currentToken: string | null = $state(null);
	let delegations: Delegation[] = $state([]);
	let selectedDelegation: string | null = $state(null);

	rootTokenStore.subscribe((v) => {
		rootToken = v;
	});
	currentTokenStore.subscribe((v) => {
		currentToken = v;
	});
	delegationsStore.subscribe((v) => {
		delegations = v;
	});
	selectedDelegationStore.subscribe((v) => {
		selectedDelegation = v;
	});

	const publicRoutes = ['/', '/login', '/register', '/profile-generator', '/batch-importer'];

	async function updateCurrentToken(
		keypair: CryptoKeyPair,
		rootToken: string | null,
		delegation: Delegation | null
	) {
		let newToken: string | null = null;

		if (delegation) {
			newToken = await issueAccessUcan(delegation.token, keypair, 60 * 60);
		} else if (rootToken) {
			newToken = await issueAccessUcan(rootToken, keypair, 60 * 60);
		}

		if (newToken) {
			currentTokenStore.set(newToken);
			await storeToken('currentToken', newToken);
		} else {
			currentTokenStore.set(null);
			await storeToken('currentToken', null);
		}
	}

	function isDelegationExpired(delegation: Delegation): boolean {
		return Date.now() > delegation.expiresAt * 1000;
	}

	function formatExpirationDate(expiresAt: number): string {
		return new Date(expiresAt * 1000).toLocaleString();
	}

	async function removeDelegation(delegationFrom: string) {
		const updatedDelegations = delegations.filter((d) => d.from !== delegationFrom);
		await storeDelegations(updatedDelegations);
		delegationsStore.set(updatedDelegations);
	}

	async function switchUser(delegationFrom: string | null) {
		const keypair = await getOrCreateKeyPair();

		if (delegationFrom === null) {
			selectedDelegationStore.set(null);
			await storeToken('selectedDelegation', null);
			await updateCurrentToken(keypair, rootToken, null);
		} else {
			const delegation = delegations.find((d) => d.from === delegationFrom);
			if (delegation) {
				if (isDelegationExpired(delegation)) {
					await removeDelegation(delegation.from);
					return;
				}
				selectedDelegationStore.set(delegationFrom);
				await storeToken('selectedDelegation', delegationFrom);
				await updateCurrentToken(keypair, rootToken, delegation);
			}
		}
	}

	const delegationOptions = $derived(() => {
		const options = [{ value: 'original', label: 'Original Account' }];

		delegations.forEach((delegation) => {
			options.push({
				value: delegation.from,
				label: delegation.from
			});
		});

		return options;
	});

	let selectValue = $state('original');

	$effect(() => {
		selectValue = selectedDelegation || 'original';
	});

	function handleSelectChange(value: string | undefined) {
		if (value === 'original') {
			switchUser(null);
		} else if (value) {
			switchUser(value);
		}
	}

	const triggerContent = $derived(
		delegationOptions().find((opt) => opt.value === selectValue)?.label ?? 'Original Account'
	);

	onMount(() => {
		// Check system preference
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		document.documentElement.classList.toggle('dark', prefersDark);

		// Listen for system preference changes
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
			document.documentElement.classList.toggle('dark', e.matches);
		});

		// Check online status
		isOnline = navigator.onLine;

		// Add event listeners for online/offline events
		const updateOnlineStatus = () => (isOnline = navigator.onLine);
		window.addEventListener('online', updateOnlineStatus);
		window.addEventListener('offline', updateOnlineStatus);

		// Check database status if route requires it
		if (routesWithDbCheck.includes(page.url.pathname)) {
			checkDbStatus();
		}

		// Cleanup event listeners on component unmount
		return () => {
			window.removeEventListener('online', updateOnlineStatus);
			window.removeEventListener('offline', updateOnlineStatus);
		};
	});

	onMount(() => {
		const init = async () => {
			let keypair = await getOrCreateKeyPair();

			const [root, current, delegations, selectedDelegation] = await Promise.all([
				getToken('rootToken'),
				getToken('currentToken'),
				getDelegations(),
				getToken('selectedDelegation')
			]);

			rootTokenStore.set(root);
			currentTokenStore.set(current);
			delegationsStore.set(delegations);
			selectedDelegationStore.set(selectedDelegation);

			await refreshTokenIfNeeded(keypair);
			await verifyAccessIfNeeded(keypair);
		};

		init();
	});

	async function refreshTokenIfNeeded(keypair: CryptoKeyPair) {
		let isExpired = false;
		if (rootToken) {
			isExpired = await isUcanExpired(rootToken);
		}

		if (!rootToken || isExpired) {
			const xTimer = Math.floor(Date.now()).toString();
			const requestBody = '{}';
			const signature = await signRequest(requestBody, keypair.privateKey);
			const xTimerSignature = await signRequest(xTimer, keypair.privateKey);
			const publicKey = await exportPublicKey(keypair.publicKey);

			const { success, data } = await refreshToken(signature, xTimer, xTimerSignature, publicKey);

			if (success && data?.token) {
				rootTokenStore.set(data.token);
				await storeToken('rootToken', data.token);
			} else {
				rootTokenStore.set(null);
				currentTokenStore.set(null);
				delegationsStore.set([]);
			}
		}
	}

	async function verifyAccessIfNeeded(keypair: CryptoKeyPair) {
		const currentPath = page.url.pathname;

		if (rootToken && (currentPath === '/register' || currentPath === '/login')) {
			goto('/');
			return;
		}

		if (rootToken) {
			let isExpired = false;
			if (currentToken) {
				isExpired = await isUcanExpired(currentToken);
			}

			if (!currentToken || isExpired) {
				const accessUcan = await issueAccessUcan(rootToken, keypair, 60 * 60);
				currentTokenStore.set(accessUcan);
				await storeToken('currentToken', accessUcan);
			}
		}

		if (!publicRoutes.includes(currentPath)) {
			if (!rootToken || !currentToken) {
				goto('/register');
				return;
			}

			const scheme = 'page';
			let hierPart = currentPath;
			let namespace = 'client';

			let pathToCheck = currentPath;
			if (currentPath.includes('/admin')) {
				namespace = 'admin';
				hierPart = currentPath.replace('/admin', '') || '/';
				pathToCheck = currentPath.replace(/^\/admin/, '') || '/';
			}

			// Only check the first segment of the path. As long as the user has permission for the first segment, they should be able to access the rest of the path
			const segments = pathToCheck.split('/').filter(Boolean);
			hierPart = '/' + (segments[0] ?? '');

			const isVerified = await verifyUcanWithCapabilities(
				currentToken,
				scheme,
				hierPart,
				namespace,
				['GET']
			);

			if (!isVerified) {
				goto('/register');
				return;
			}
		}
	}
</script>

<svelte:head>
	<title>{page.data.title ? `${page.data.title} | ${siteName}` : siteName}</title>
	<script lang="ts">
		// Prevent flash of wrong theme
		(() => {
			if (typeof window !== 'undefined') {
				const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
				document.documentElement.classList.toggle('dark', isDark);
			}
		})();
	</script>
</svelte:head>

<Toaster position="top-center" richColors={true} />

<div class="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
	{#if delegations.length > 0 && rootToken}
		<div
			class="bg-blue-50 border-b border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100"
		>
			<div class="container mx-auto px-4 py-3">
				<div class="flex items-center justify-center space-x-4">
					<User class="w-4 h-4 text-blue-600 dark:text-blue-400" />
					<span class="text-sm font-medium">Acting as:</span>

					<Select.Root type="single" bind:value={selectValue} onValueChange={handleSelectChange}>
						<Select.Trigger
							class="w-[240px] bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 focus:ring-2 focus:ring-slate-950 dark:focus:ring-slate-300 focus:ring-offset-2 rounded-md px-3 py-2 text-sm"
						>
							<span class="truncate">{triggerContent}</span>
						</Select.Trigger>
						<Select.Content class="min-w-[240px] max-w-[400px]">
							<Select.Group>
								<Select.Label
									class="px-2 py-1.5 text-sm font-semibold text-slate-900 dark:text-slate-50"
									>Available Accounts</Select.Label
								>
								{#each delegationOptions() as option (option.value)}
									<Select.Item
										value={option.value}
										label={option.label}
										class="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-slate-100 dark:focus:bg-slate-800 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
									>
										<div class="flex items-center justify-between w-full min-w-0 overflow-hidden">
											<span class="truncate flex-1 mr-2">{option.label}</span>
											{#if option.value !== 'original'}
												{@const delegation = delegations.find((d) => d.from === option.value)}
												{#if delegation}
													<div class="flex items-center space-x-1 text-xs flex-shrink-0">
														<Clock class="w-3 h-3" />
														<span
															class={isDelegationExpired(delegation)
																? 'text-red-500 dark:text-red-400'
																: 'text-slate-500 dark:text-slate-400'}
														>
															{isDelegationExpired(delegation)
																? 'Expired'
																: formatExpirationDate(delegation.expiresAt)}
														</span>
													</div>
												{/if}
											{/if}
										</div>
									</Select.Item>
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>
				</div>
			</div>
		</div>
	{/if}

	{#if !isAdminRoute && showMenubar}
		<!-- Status Alerts - Position below delegation bar -->
		{#if !isOnline}
			<div class="bg-red-500 border-b border-red-600 text-white shadow-lg">
				<div class="container mx-auto px-4 py-3">
					<div class="flex items-center justify-center space-x-2">
						<WifiOff class="w-5 h-5 text-white" />
						<span class="font-semibold">OFFLINE</span>
						<span class="text-red-100">Check your network connection</span>
					</div>
				</div>
			</div>
		{/if}

		{#if routesWithDbCheck.includes(page.url.pathname) && !isDbOnline}
			<div
				class="bg-amber-100 border-b border-amber-200 text-amber-800 dark:bg-amber-900 dark:border-amber-800 dark:text-amber-200"
			>
				<div class="container mx-auto px-4 py-3">
					<div class="flex items-center justify-center space-x-2">
						<AlertCircle class="w-5 h-5 text-amber-600 dark:text-amber-400" />
						<span class="font-medium">Database Connection Issue</span>
						<span class="text-amber-700 dark:text-amber-300"
							>Unable to connect to the database, please try again in a few minutes</span
						>
					</div>
				</div>
			</div>
		{/if}

		<div class="container mx-auto px-4 py-4">
			<header class="mb-8">
				<h1 class="mb-6 text-3xl font-bold text-slate-900 dark:text-slate-50">
					<a href="/" class="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
						{siteName}
					</a>
				</h1>
			</header>

			<div class="mb-6">
				<Menubar>
					<MenubarMenu value="home">
						<MenubarTrigger>
							<a href="/">Home</a>
						</MenubarTrigger>
					</MenubarMenu>

					<MenubarMenu value="profile-generator">
						<MenubarTrigger>
							<a href="/profile-generator">Profile Generator</a>
						</MenubarTrigger>
					</MenubarMenu>

					<MenubarMenu value="batch-importer">
						<MenubarTrigger>
							<a href="/batch-importer">Batch Importer</a>
						</MenubarTrigger>
					</MenubarMenu>

					<MenubarMenu value="index-explorer">
						<MenubarTrigger>
							<a href="/index-explorer">Index Explorer</a>
						</MenubarTrigger>
					</MenubarMenu>

					<MenubarMenu value="index-updater">
						<MenubarTrigger>
							<a href="/index-updater">Index Updater</a>
						</MenubarTrigger>
					</MenubarMenu>

					{#if currentToken}
						<MenubarMenu value="generate-delegation">
							<MenubarTrigger>
								<a href="/generate-delegation">Generate Delegation</a>
							</MenubarTrigger>
						</MenubarMenu>

						<MenubarMenu value="receive-delegation">
							<MenubarTrigger>
								<a href="/receive-delegation">Receive Delegation</a>
							</MenubarTrigger>
						</MenubarMenu>
					{/if}

					<MenubarMenu>
						<MenubarTrigger class="ml-auto">
							{#if !currentToken}
								<a href="/register">Login</a>
							{/if}
						</MenubarTrigger>
					</MenubarMenu>
				</Menubar>
			</div>

			{@render children()}
		</div>
	{:else}
		{@render children()}
	{/if}
</div>
