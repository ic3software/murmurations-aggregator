<script lang="ts">
	import { goto } from '$app/navigation';
	import { register } from '$lib/api/auth-request';
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
	import { storeToken } from '$lib/core';
	import { exportPublicKey, getOrCreateKeyPair, signRequest } from '$lib/crypto';
	import type { CryptoKeyPair } from '$lib/types/crypto';
	import { AlertCircle, Home } from '@lucide/svelte';

	import { onMount } from 'svelte';

	let { form } = $props();

	let name = $state('');
	let isSubmitting = $state(false);
	let keypair: CryptoKeyPair | null = $state(null);
	let error = $state<string | null>(null);

	onMount(async () => {
		keypair = await getOrCreateKeyPair();
	});

	async function handleRegister(event: Event) {
		event.preventDefault();

		if (!keypair || !name.trim()) return;

		isSubmitting = true;
		error = null;

		try {
			const body = { name };
			const requestBody = JSON.stringify(body);
			const xTimer = Math.floor(Date.now());
			const signature = await signRequest(requestBody, keypair.privateKey);
			const xTimerSignature = await signRequest(xTimer.toString(), keypair.privateKey);
			const publicKey = await exportPublicKey(keypair.publicKey);

			const {
				data,
				success,
				error: registerError
			} = await register(name, signature, xTimer.toString(), xTimerSignature, publicKey);

			if (!success || !data?.token) {
				error = registerError || 'Registration failed';
				return;
			}

			await storeToken('rootToken', data.token);
			await storeToken('currentToken', data.token);

			goto('/');
		} catch (err) {
			error = err instanceof Error ? err.message : 'An unknown error occurred';
		} finally {
			isSubmitting = false;
		}
	}
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
			{#if form?.error || error}
				<Alert variant="destructive">
					<AlertCircle class="h-4 w-4" />
					<AlertDescription>
						{form?.error || error}
					</AlertDescription>
				</Alert>
			{/if}

			<form onsubmit={handleRegister}>
				<div class="space-y-4">
					<div class="space-y-2">
						<Label for="name">Username</Label>
						<Input
							id="name"
							name="name"
							type="text"
							placeholder="Enter your username"
							bind:value={name}
							disabled={isSubmitting}
							required
						/>
					</div>

					<Button class="w-full" type="submit" disabled={isSubmitting || !name.trim() || !keypair}>
						{isSubmitting ? 'Creating Account...' : 'Create Account'}
					</Button>
				</div>
			</form>

			<Button href="/" class="w-full" variant="outline">
				<Home class="mr-2 h-4 w-4" />
				Go to Home
			</Button>
		</CardContent>
	</Card>
</div>
