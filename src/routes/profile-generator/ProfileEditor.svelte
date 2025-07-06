<script lang="ts">
	import { dbStatus } from '$lib/stores/db-status';
	import type { ProfileInsert, ProfileObject } from '$lib/types/profile';
	import type { Schema } from '$lib/types/schema';
	import { generateSchemaInstance } from '$lib/utils/generator';
	import { parseRef } from '$lib/utils/parser';
	import { createId } from '@paralleldrive/cuid2';

	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	import DynamicForm from './DynamicForm.svelte';

	interface Props {
		schemasSelected: string[];
		currentProfile: ProfileObject;
		currentTitle: string;
		currentCuid: string;
		schemasReset: () => void;
		profileUpdated: () => void;
		profileEditorErrorOccurred: (error: string | null) => void;
	}

	let {
		schemasSelected,
		currentProfile = {},
		currentTitle = '',
		currentCuid = '',
		schemasReset,
		profileUpdated,
		profileEditorErrorOccurred
	}: Props = $props();

	let profilePreview: boolean = $state(false);
	let validationErrors: string[] = $state([]);
	let serviceError: string = $state('');
	let isSubmitting: boolean = $state(false);
	let top: HTMLDivElement | undefined = $state();

	let isDbOnline: boolean = $state(get(dbStatus));
	let schemas: Schema | null = $state(null);

	// Subscribe to dbStatus changes
	dbStatus.subscribe((value) => {
		isDbOnline = value;
	});

	// Use parseRef to retrieve the schema based on schemasSelected
	onMount(async () => {
		try {
			profileEditorErrorOccurred(null);
			schemas = await parseRef(schemasSelected);
		} catch (err) {
			profileEditorErrorOccurred(err as string | null);
			resetSchemas();
		}
	});

	function scrollToTop(): void {
		top?.scrollIntoView();
	}

	function resetSchemas(): void {
		schemasReset();
	}

	async function handleSubmit(event: SubmitEvent): Promise<void> {
		// TODO - determine if we really need to prevent the default form submission behavior
		event.preventDefault();
		isSubmitting = true;
		serviceError = '';
		const target = event.target as HTMLFormElement | null;
		if (target) {
			const formData = new FormData(target);
			const formDataObject: Record<string, string | string[]> = {};

			// Find all the fields that have multiple select
			const multipleSelects: Set<string> = new Set();
			const selects = target.querySelectorAll('select[multiple]');
			selects.forEach((select) => {
				const selectElement = select as HTMLSelectElement;
				multipleSelects.add(selectElement.name);
			});

			formData.forEach((value, key) => {
				if (multipleSelects.has(key)) {
					if (!formDataObject[key]) {
						formDataObject[key] = [];
					}
					(formDataObject[key] as string[]).push(value as string);
				} else if (typeof value === 'string') {
					// Only retain string values
					formDataObject[key] = value;
				}
			});

			currentProfile = generateSchemaInstance(schemas, formDataObject);

			const response = await fetch('/profile-generator/validate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(currentProfile)
			});

			const data = await response.json();
			if (response.status === 422) {
				validationErrors = data?.errors?.map(
					(error: { title: string; detail: string; source?: { pointer?: string } }) => {
						const pointer = error.source?.pointer || 'Unknown source';
						return `${error.title}: ${error.detail} (Source: ${pointer})`;
					}
				);
				// Scroll to the top of the page if there are validation errors
				if (validationErrors.length > 0) {
					scrollToTop();
				}
			} else if (response.status !== 200) {
				serviceError =
					typeof data.errors === 'string'
						? data.errors
						: `Unexpected response status: ${response.status}`;
				scrollToTop();
			} else {
				validationErrors = [];
				profilePreview = true;
			}
		}
		isSubmitting = false;
	}

	async function saveAndPostProfile(event: SubmitEvent): Promise<void> {
		event.preventDefault();
		isSubmitting = true;
		serviceError = '';

		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);
		const title = formData.get('title') as string;

		try {
			const cuid = currentCuid || createId();
			const profileToSave: ProfileInsert = {
				cuid,
				linkedSchemas: JSON.stringify(schemasSelected),
				profile: JSON.stringify(currentProfile),
				title,
				lastUpdated: Date.now(),
				nodeId: ''
			};

			const method = currentCuid ? 'PATCH' : 'POST';

			const response = await fetch(`/profile-generator${currentCuid ? `/${cuid}` : ''}`, {
				method,
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(profileToSave)
			});

			if (response.status === 422) {
				const data = await response.json();
				validationErrors = data?.errors.map(
					(error: { source?: { pointer?: string }; title: string; detail: string }) => {
						const pointer = error.source?.pointer || 'Unknown source';
						return `${error.title}: ${error.detail} (Source: ${pointer})`;
					}
				);
				// Scroll to the top of the page if there are validation errors
				if (validationErrors.length > 0) {
					scrollToTop();
				}
				profilePreview = false;
				return;
			}

			if (!response.ok) {
				const errorData = await response.json();
				console.log('errorData', errorData);
				throw errorData.error || 'Error saving profile';
			}

			const result = await response.json();
			if (result.success) {
				console.log('Profile saved successfully!');
			} else {
				throw new Error('Unknown error occurred while saving profile');
			}

			if (currentCuid) {
				const node_id = await postProfileToIndex(cuid);
				console.log('Profile updated to index with node_id:', node_id);
			} else {
				// Post profile URL to index and get node_id
				const node_id = await postProfileToIndex(cuid);

				// Update profile with node_id in DB
				const updateNodeIdResponse = await fetch(`/profile-generator/${cuid}/update-node-id`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ profile_cuid: cuid, node_id })
				});

				if (!updateNodeIdResponse.ok) {
					const updateNodeIdErrorData = await updateNodeIdResponse.json();
					throw new Error(updateNodeIdErrorData.error || 'Error updating node_id');
				}

				const updateNodeIdResult = await updateNodeIdResponse.json();
				if (updateNodeIdResult.success) {
					console.log('Profile updated with node_id successfully');
				} else {
					throw new Error('Unknown error occurred while updating node_id');
				}
			}

			// Reset to initial state
			profilePreview = false;
			profileEditorErrorOccurred(null);
			resetSchemas();
		} catch (err) {
			console.error('Error saving and posting profile:', err);
			profileEditorErrorOccurred(err as string | null);
		}

		profileUpdated();
		isSubmitting = false;
	}

	async function postProfileToIndex(cuid: string): Promise<string> {
		try {
			const response = await fetch(`/profile-generator/index/${cuid}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Error posting profile to index');
			}

			const result = await response.json();
			return result.node_id;
		} catch (err) {
			console.error('Error posting profile to index:', err);
			throw err;
		}
	}
</script>

<div class="md:basis-2/3 md:order-first">
	{#if validationErrors.length > 0}
		<div class="variant-filled-error m-4 py-2 px-4 rounded-md text-left">
			<p class="font-medium">There were errors in your submission:</p>
			<ul class="list-disc list-inside">
				{#each validationErrors as error}
					<li>{error}</li>
				{/each}
			</ul>
		</div>
	{/if}
	<div class="card variant-ghost-primary m-4 p-4" bind:this={top}>
		{#if serviceError != ''}
			<div class="variant-filled-error py-2 px-4 rounded-md">
				{serviceError}
			</div>
		{/if}

		{#if !profilePreview}
			<div class="font-medium mb-4">Editing profile with the following schemas</div>

			{#each schemasSelected as schema}
				<span class="badge variant-ghost-primary font-medium text-sm mx-4 mb-2">{schema}</span>
			{/each}

			<form onsubmit={handleSubmit}>
				<div class="m-4 flex flex-col text-left">
					{#if schemas !== null}
						<DynamicForm {schemas} {currentProfile} />
					{/if}
				</div>
				<div class="flex justify-around mt-0">
					<button
						type="submit"
						class="btn font-semibold md:btn-lg variant-filled-primary"
						disabled={isSubmitting}
					>
						{#if isSubmitting}
							Loading...
						{:else}
							Validate
						{/if}
					</button>
					<button
						type="button"
						onclick={resetSchemas}
						class="btn font-semibold md:btn-lg variant-filled-secondary">Reset</button
					>
				</div>
			</form>
		{/if}

		{#if profilePreview}
			<div class="font-medium text-lg mb-4 mx-4 variant-filled-success py-2 px-4 rounded-md">
				The profile is valid
			</div>

			<div class="m-4 bg-primary-300 dark:bg-primary-900 rounded-xl px-4 py-2">
				<pre class="text-sm text-left whitespace-pre-wrap break-all">{JSON.stringify(
						{ linked_schemas: schemasSelected, ...currentProfile },
						null,
						2
					)}</pre>
			</div>
			<div class="flex justify-around mt-4 md:mt-8">
				<button
					onclick={() => (profilePreview = false)}
					disabled={isSubmitting}
					class="btn font-semibold md:btn-lg variant-filled-primary">Continue Editing</button
				>
			</div>
			<form onsubmit={saveAndPostProfile}>
				<div class="mt-4 md:mt-8">
					<div class="m-4 flex flex-col text-left">
						<label>
							<div class="my-2 dark:text-white">Title:</div>
							<input
								class="w-full dark:bg-gray-700 dark:text-white"
								name="title"
								id="title"
								type="text"
								value={currentTitle}
								required
							/>
						</label>
					</div>
				</div>
				<button
					class="btn font-semibold md:btn-lg variant-filled-primary"
					disabled={!isDbOnline || isSubmitting}>Save & Post</button
				>
			</form>
		{/if}
	</div>
</div>
