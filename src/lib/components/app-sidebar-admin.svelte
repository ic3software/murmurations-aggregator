<script lang="ts" module>
	import DatabaseIcon from '@lucide/svelte/icons/database';
	import GlobeIcon from '@lucide/svelte/icons/globe';
	import KeyIcon from '@lucide/svelte/icons/key';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import ShieldIcon from '@lucide/svelte/icons/shield';
	import UsersIcon from '@lucide/svelte/icons/users';

	const data = {
		navMain: [
			{
				title: 'Clusters',
				url: '/admin',
				icon: DatabaseIcon
			},
			{
				title: 'Source Config',
				url: '/admin/source-indexes',
				icon: SettingsIcon
			},
			{
				title: 'Users',
				url: '/admin/users',
				icon: UsersIcon
			},
			{
				title: 'Roles',
				url: '/admin/roles',
				icon: ShieldIcon
			},
			{
				title: 'Capabilities',
				url: '/admin/capabilities',
				icon: KeyIcon
			},
			{
				title: 'Go to User Site',
				url: '/',
				icon: GlobeIcon
			}
		]
	};
</script>

<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';

	import type { ComponentProps } from 'svelte';

	import NavMain from './nav-main.svelte';

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root {...restProps} bind:ref>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props }: { props: Record<string, unknown> })}
						<a href="/" {...props}>
							<div
								class="bg-red-600 text-white flex aspect-square size-8 items-center justify-center rounded-lg"
							>
								<MapPinIcon class="size-4" />
							</div>
							<div class="flex flex-col gap-0.5 leading-none">
								<span class="font-medium">MurmurMaps Admin</span>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={data.navMain} />
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
