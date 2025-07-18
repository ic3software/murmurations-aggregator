<script lang="ts">
	import { goto } from '$app/navigation';
	import { linkPublicKey } from '$lib/api/keys';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { AlertCircle, Home } from '@lucide/svelte';

	import { onMount } from 'svelte';

	let token;
	let errorMessage = '';

	onMount(async () => {
		const params = new URLSearchParams(window.location.search);
		token = params.get('token');

		if (!token) {
			errorMessage = 'Invalid invitation link';
			return;
		}

		try {
			const { success, error } = await linkPublicKey(token);

			if (success) {
				goto('/admin', {
					state: { message: 'You are now signed in to your account from this device.' },
					replaceState: true
				});
			} else {
				errorMessage = error || 'An error occurred';
			}
		} catch (error) {
			console.error('Error posting key:', error);
			errorMessage = 'Key linking failed';
		}
	});
</script>

<div class="flex h-screen items-center justify-center bg-background">
	<Card class="w-full max-w-md">
		<CardHeader>
			<CardTitle>Login</CardTitle>
			<CardDescription>Processing your login request...</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			{#if errorMessage}
				<Alert variant="destructive">
					<AlertCircle class="h-4 w-4" />
					<AlertDescription>
						{errorMessage}
					</AlertDescription>
				</Alert>
			{/if}
			<Button href="/" class="w-full">
				<Home class="mr-2 h-4 w-4" />
				Go to Home
			</Button>
		</CardContent>
	</Card>
</div>
