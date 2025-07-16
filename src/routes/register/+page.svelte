<script lang="ts">
	import { goto } from '$app/navigation';
	import { register } from '$lib/api/register';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { isLoggedIn, login } from '$lib/stores/auth';
	import { AlertCircle, Home } from '@lucide/svelte';

	import { onMount } from 'svelte';

	let name = $state('');
	let errorMessage = $state('');
	let isRegistering = $state(false);

	async function handleRegister() {
		if (!name.trim()) {
			errorMessage = 'Please enter your name';
			return;
		}

		try {
			isRegistering = true;
			const { data, success, error } = await register(name);

			if (!success) {
				errorMessage = `${error}`;
				return;
			}

			if (data?.token) {
				login(data?.token);
			}

			goto('/', {
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
		if ($isLoggedIn) {
			goto('/', {
				state: { message: 'You have already signed in' },
				replaceState: true
			});
		}
	});
</script>

<div class="flex h-screen items-center justify-center bg-background">
	<Card class="w-full max-w-md">
		<CardHeader>
			<CardTitle>Register</CardTitle>
			<CardDescription class="mt-2">
				Enter a username to identify you on this demo website. <br />
				Your username will be linked to the key pair that was created and stored in your browser.
			</CardDescription>
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

			<div class="space-y-2">
				<Label for="username">Username</Label>
				<Input
					id="username"
					type="text"
					placeholder="Enter your username"
					bind:value={name}
					disabled={isRegistering}
				/>
			</div>

			<Button class="w-full" onclick={handleRegister} disabled={isRegistering || !name.trim()}>
				{isRegistering ? 'Creating Account...' : 'Create Account'}
			</Button>

			<Button href="/" class="w-full" variant="outline">
				<Home class="mr-2 h-4 w-4" />
				Go to Home
			</Button>
		</CardContent>
	</Card>
</div>
