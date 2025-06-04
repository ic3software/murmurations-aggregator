<script lang="ts">
	import { Toaster } from '$lib/components/ui/sonner';

	import { onMount } from 'svelte';

	import '../app.css';

	let { children } = $props();

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

<div class="min-h-screen bg-background text-foreground">
	<Toaster />
	{@render children()}
</div>
