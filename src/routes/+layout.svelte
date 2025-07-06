<script lang="ts">
	import { page } from '$app/state';
	import { Menubar, MenubarMenu, MenubarTrigger } from '$lib/components/ui/menubar';
	import { Toaster } from '$lib/components/ui/sonner';

	import { onMount } from 'svelte';

	import '../app.css';

	let { children } = $props();

	const siteName = 'Murmurations Collaborative Cluster';
	const isAdminRoute = $derived(page.url.pathname.startsWith('/admin'));

	onMount(() => {
		// Check system preference
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		document.documentElement.classList.toggle('dark', prefersDark);

		// Listen for system preference changes
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
			document.documentElement.classList.toggle('dark', e.matches);
		});
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

{#if !isAdminRoute}
	<div class="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
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
				</Menubar>
			</div>

			{@render children()}
		</div>
	</div>
{:else}
	{@render children()}
{/if}
