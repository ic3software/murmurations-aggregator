<script lang="ts">
	import { page } from '$app/state';
	import { refreshToken } from '$lib/api/auth-request';
	import { Menubar, MenubarMenu, MenubarTrigger } from '$lib/components/ui/menubar';
	import { Toaster } from '$lib/components/ui/sonner';
	import { exportPublicKey, getOrCreateKeyPair, signRequest } from '$lib/crypto';
	import { dbStatus } from '$lib/stores/db-status';
	import { checkDbStatus } from '$lib/utils/check-db-status';
	import { AlertCircle, WifiOff } from '@lucide/svelte';

	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';

	import '../app.css';

	interface Props {
		children: Snippet;
		data: {
			user: string | null;
		};
	}

	let { children, data }: Props = $props();

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

	/* global CryptoKeyPair */
	let keypair: CryptoKeyPair | null = $state(null);

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

	onMount(async () => {
		keypair = await getOrCreateKeyPair();

		// Refresh token if user is empty
		if (!data?.user) {
			const xTimer = Math.floor(Date.now()).toString();
			const requestBody = '{}';
			const signature = await signRequest(requestBody, keypair.privateKey);
			const xTimerSignature = await signRequest(xTimer, keypair.privateKey);
			const publicKey = await exportPublicKey(keypair.publicKey);

			refreshToken(signature, xTimer, xTimerSignature, publicKey);
		}
	});
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

					<MenubarMenu>
						<MenubarTrigger class="ml-auto">
							{#if !data?.user}
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
