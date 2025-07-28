<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { refreshToken } from '$lib/api/auth-request';
	import { Menubar, MenubarMenu, MenubarTrigger } from '$lib/components/ui/menubar';
	import { Toaster } from '$lib/components/ui/sonner';
	import { getToken, storeToken } from '$lib/core';
	import { exportPublicKey, getOrCreateKeyPair, signRequest } from '$lib/crypto';
	import { dbStatus } from '$lib/stores/db-status';
	import { currentTokenStore, delegationsStore, rootTokenStore } from '$lib/stores/token-store';
	import type { CryptoKeyPair } from '$lib/types/crypto';
	import type { Delegation } from '$lib/types/delegation';
	import { checkDbStatus } from '$lib/utils/check-db-status';
	import {
		issueAccessUcan,
		isUcanExpired,
		verifyUcanWithCapabilities
	} from '$lib/utils/ucan-utils';
	import { AlertCircle, WifiOff } from '@lucide/svelte';

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

	rootTokenStore.subscribe((v) => {
		rootToken = v;
	});
	currentTokenStore.subscribe((v) => {
		currentToken = v;
	});
	delegationsStore.subscribe((v) => {
		delegations = v;
	});

	const publicRoutes = [
		'/',
		'/login',
		'/register',
		'/profile-generator',
		'/batch-importer',
		'/generate-delegation',
		'/receive-delegation'
	];

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

			const [root, current] = await Promise.all([getToken('rootToken'), getToken('currentToken')]);

			rootTokenStore.set(root);
			currentTokenStore.set(current);

			await refreshTokenIfNeeded(keypair);
			await verifyAccessIfNeeded(keypair);

			// TODO: Remove this after using the delegations store
			console.log('delegations', delegations);
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
				goto('/register');
				return;
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
				// goto('/register');
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

{#if !isAdminRoute && showMenubar}
	<div class="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
		<!-- Status Alerts - Position above everything -->
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
	</div>
{:else}
	{@render children()}
{/if}
