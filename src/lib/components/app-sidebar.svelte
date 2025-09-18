<script lang="ts" module>
	import MapIcon from '@lucide/svelte/icons/map';
	import UserCircleIcon from '@lucide/svelte/icons/user-circle';
	import UserPlusIcon from '@lucide/svelte/icons/user-plus';
	import WrenchIcon from '@lucide/svelte/icons/wrench';

	const data = {
		navMain: [
			{
				title: 'Getting Started',
				url: '#',
				icon: MapIcon,
				items: [
					{
						title: 'Clusters',
						url: '/'
					}
				]
			},
			{
				title: 'Tools',
				url: '#',
				icon: WrenchIcon,
				items: [
					{
						title: 'Profile Generator',
						url: '/profile-generator'
					},
					{
						title: 'Batch Importer',
						url: '/batch-importer'
					},
					{
						title: 'Index Updater',
						url: '/index-updater'
					},
					{
						title: 'Index Explorer',
						url: '/index-explorer'
					}
				]
			},
			{
				title: 'Account',
				url: '#',
				icon: UserCircleIcon,
				requiresToken: true,
				items: [
					{
						title: 'Generate Delegation',
						url: '/generate-delegation'
					},
					{
						title: 'Receive Delegation',
						url: '/receive-delegation'
					}
				]
			},
			{
				title: 'Register',
				url: '/register',
				icon: UserPlusIcon,
				hideWhenToken: true
			}
		]
	};
</script>

<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';

	import type { ComponentProps } from 'svelte';

	import NavMain from './nav-main.svelte';

	let {
		ref = $bindable(null),
		currentToken = null,
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & { currentToken?: string | null } = $props();

	const filteredNavMain = $derived(
		data.navMain.filter((item) => {
			if (item.requiresToken && !currentToken) return false;
			if (item.hideWhenToken && currentToken) return false;
			return true;
		})
	);
</script>

<Sidebar.Root {...restProps} bind:ref>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props }: { props: Record<string, unknown> })}
						<a href="/" {...props}>
							<div
								class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
							>
								<MapPinIcon class="size-4" />
							</div>
							<div class="flex flex-col gap-0.5 leading-none">
								<span class="font-medium">MurmurMaps</span>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={filteredNavMain} />
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
