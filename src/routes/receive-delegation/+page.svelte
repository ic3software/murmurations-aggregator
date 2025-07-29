<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { getDelegations, storeDelegations } from '$lib/core';
	import { delegationsStore } from '$lib/stores/token-store';
	import { decodeUcanToDelegation } from '$lib/utils/ucan-utils';

	import { toast } from 'svelte-sonner';

	let delegationToken = $state('');
	let isProcessing = $state(false);

	async function processDelegation() {
		if (!delegationToken.trim()) {
			toast.error('Please enter a delegation token');
			return;
		}

		isProcessing = true;

		try {
			const delegation = await decodeUcanToDelegation(delegationToken.trim());

			const currentDelegations = await getDelegations();

			const exists = currentDelegations.some((d) => d.token === delegation.token);
			if (exists) {
				toast.error('This delegation has already been received');
				return;
			}

			const updatedDelegations = [...currentDelegations, delegation];

			await storeDelegations(updatedDelegations);

			delegationsStore.set(updatedDelegations);

			toast.success('Delegation received successfully');
			delegationToken = '';
		} catch (error) {
			console.error('Failed to parse delegation token:', error);
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error('Invalid delegation token format');
			}
		} finally {
			isProcessing = false;
		}
	}
</script>

<div class="w-full space-y-6">
	<div>
		<h1 class="text-3xl font-bold text-slate-900 dark:text-slate-50">Receive Delegation</h1>
		<p class="text-slate-600 dark:text-slate-400 mt-2">
			Paste a delegation token below to receive delegated capabilities from another user.
		</p>
	</div>

	<Card>
		<CardHeader>
			<CardTitle>Delegation Token</CardTitle>
			<CardDescription>Enter the delegation token that was shared with you.</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="space-y-2">
				<Label for="delegation-token">Delegation Token</Label>
				<Textarea
					id="delegation-token"
					placeholder="Paste your delegation token here..."
					bind:value={delegationToken}
					rows={8}
					class="font-mono text-sm"
				/>
			</div>

			<Button
				onclick={processDelegation}
				disabled={isProcessing || !delegationToken.trim()}
				class="w-full"
			>
				{isProcessing ? 'Processing...' : 'Receive Delegation'}
			</Button>
		</CardContent>
	</Card>
</div>
