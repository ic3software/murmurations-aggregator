<script lang="ts">
	import { goto } from '$app/navigation';
	import { fetchKeys, fetchUsers } from '$lib/api';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { AlertCircle } from '@lucide/svelte';

	import { onMount } from 'svelte';

	let name = $state('');
	let errorMessage = $state('');
	let isRegistering = $state(false);

	async function register() {
		if (!name.trim()) {
			errorMessage = 'Please enter your name';
			return;
		}

		try {
			isRegistering = true;
			const { success, error } = await fetchUsers('POST', { name });
			if (!success) {
				errorMessage = `${error}`;
				return;
			}
			goto('/admin', {
				state: {
					message:
						'Your account has been created. Try closing and reopening the browser. You will be logged in automatically!'
				},
				replaceState: true
			});
		} catch (error) {
			console.error('Error during registration:', error);
			errorMessage = 'An error occurred during registration';
		} finally {
			isRegistering = false;
		}
	}

	onMount(async () => {
		try {
			const { success } = await fetchKeys('GET');
			if (success) {
				goto('/admin', {
					state: { message: 'You have already signed in' },
					replaceState: true
				});
			}
		} catch (error) {
			errorMessage = 'An unexpected error occurred while verifying login status. Error: ' + error;
			console.error('Error verifying login status:', error);
		}
	});
</script>

<svelte:head>
	<title>Register | Murmurations Collaborative Cluster Builder</title>
</svelte:head>

<div
	class="min-h-screen flex items-center justify-center bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50"
>
	<div class="container flex flex-col items-center justify-center mx-auto px-4 py-8">
		<header class="mb-8 w-full flex flex-col items-center">
			<h1 class="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-50 text-center">
				Murmurations Collaborative Cluster Builder <br /> Admin Panel
			</h1>
		</header>

		<div class="max-w-md w-full flex flex-col items-center">
			<Card.Root class="shadow-lg w-full">
				<Card.Header class="space-y-1">
					<Card.Title class="text-2xl text-center">Create Account</Card.Title>
					<Card.Description class="text-center">
						Enter a username to identify you on this demo website
					</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					{#if errorMessage}
						<Alert.Root variant="destructive">
							<AlertCircle class="h-4 w-4" />
							<Alert.Description>
								{errorMessage}
							</Alert.Description>
						</Alert.Root>
					{/if}

					<div class="space-y-2">
						<p class="text-sm text-slate-500 dark:text-slate-400 text-center">
							Your username will be linked to the key pair that was created and stored in your
							browser.
						</p>
					</div>

					<div class="space-y-2">
						<Label for="username" class="text-center w-full">Username</Label>
						<Input
							id="username"
							type="text"
							placeholder="Enter your username"
							bind:value={name}
							disabled={isRegistering}
						/>
					</div>

					<Button class="w-full" onclick={register} disabled={isRegistering || !name.trim()}>
						{isRegistering ? 'Creating Account...' : 'Create Account'}
					</Button>
					<Button class="w-full mt-2" href="/" variant="secondary">Back to Home</Button>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>
