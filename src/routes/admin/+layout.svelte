<script lang="ts">
	import { page } from '$app/state';
	import { Menubar, MenubarMenu, MenubarTrigger } from '$lib/components/ui/menubar';

	let { children } = $props();

	const hiddenRoutes = ['/admin/login', '/admin/register'];
	const showMenubar = $derived(!hiddenRoutes.includes(page.url.pathname));

	const siteName = 'Murmurations Collaborative Cluster Builder';
</script>

<svelte:head>
	<title>{page.data.title ? `${page.data.title} | ${siteName}` : siteName}</title>
</svelte:head>

{#if showMenubar}
	<div class="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
		<div class="container mx-auto px-4 py-4">
			<header class="mb-8">
				<h1 class="mb-6 text-3xl font-bold text-slate-900 dark:text-slate-50">
					{siteName}
				</h1>
			</header>

			<div class="mb-6">
				<Menubar>
					<MenubarMenu value="dashboard">
						<MenubarTrigger>
							<a href="/admin">Dashboard</a>
						</MenubarTrigger>
					</MenubarMenu>

					<MenubarMenu value="profile">
						<MenubarTrigger>
							<a href="/admin/profile">Profile</a>
						</MenubarTrigger>
					</MenubarMenu>

					<MenubarMenu value="source-indexes">
						<MenubarTrigger>
							<a href="/admin/source-indexes">Source Config</a>
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
