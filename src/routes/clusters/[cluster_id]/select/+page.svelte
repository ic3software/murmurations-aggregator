<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	let clusterId = $state('');

	onMount(() => {
		clusterId = page.params.cluster_id;
	});
</script>

<div>
	<p>cluster_id: {clusterId}</p>
</div>
