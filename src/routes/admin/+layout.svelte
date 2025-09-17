<script lang="ts">
	import { page } from '$app/state';
	import { Menubar, MenubarMenu, MenubarTrigger } from '$lib/components/ui/menubar';

	let { children } = $props();

	const siteName = 'MurmurMaps Admin';
</script>

<svelte:head>
	<title>{page.data.title ? `${page.data.title} | ${siteName}` : siteName}</title>
</svelte:head>

<div class="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
	<div class="container mx-auto px-4 py-4">
		<header class="mb-8">
			<h1 class="mb-6 text-3xl font-bold text-slate-900 dark:text-slate-50">
				{siteName}
			</h1>
		</header>

		<div class="mb-6">
			<Menubar>
				<MenubarMenu value="clusters">
					<MenubarTrigger>
						<a href="/admin">Clusters</a>
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

				<MenubarMenu value="users">
					<MenubarTrigger>
						<a href="/admin/users">Users</a>
					</MenubarTrigger>
				</MenubarMenu>

				<MenubarMenu value="roles">
					<MenubarTrigger>
						<a href="/admin/roles">Roles</a>
					</MenubarTrigger>
				</MenubarMenu>

				<MenubarMenu value="capabilities">
					<MenubarTrigger>
						<a href="/admin/capabilities">Capabilities</a>
					</MenubarTrigger>
				</MenubarMenu>
			</Menubar>
		</div>

		{@render children()}
	</div>
</div>
