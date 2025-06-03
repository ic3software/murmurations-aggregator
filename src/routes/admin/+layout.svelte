<script lang="ts">
	import { page } from '$app/state';
	import { Menubar, MenubarMenu, MenubarTrigger } from '$lib/components/ui/menubar';

	let { children } = $props();

	const hiddenRoutes = ['/admin/login', '/admin/register'];
	const showMenubar = $derived(!hiddenRoutes.includes(page.url.pathname));
</script>

{#if showMenubar}
	<div class="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
		<div class="container mx-auto px-4 py-4">
			<header class="mb-8">
				<h1 class="mb-6 text-3xl font-bold text-slate-900 dark:text-slate-50">
					Murmurations Collaborative Cluster Builder
				</h1>
			</header>

			<div class="mb-6">
				<Menubar>
					<MenubarMenu>
						<MenubarTrigger>
							<a href="/admin">Dashboard</a>
						</MenubarTrigger>
						<MenubarTrigger>
							<a href="/admin/profile">Profile</a>
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
