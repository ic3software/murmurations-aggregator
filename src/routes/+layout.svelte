<script lang="ts">
	import { page } from '$app/state';
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
					{siteName}
				</h1>
			</header>

			{@render children()}
		</div>
	</div>
{:else}
	{@render children()}
{/if}
