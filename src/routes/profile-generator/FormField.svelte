<script lang="ts">
	import type { ProfileArray, ProfileObject, ProfileValue } from '$lib/types/profile';
	import type { Field } from '$lib/types/schema';

	import { writable } from 'svelte/store';

	import FormField from './FormField.svelte';

	interface Props {
		name: string;
		fieldName: string;
		field: Field;
		hideTitle?: boolean;
		hideDescription?: boolean;
		requiredFields?: string[];
		isParentRequired?: boolean;
		isParentArray?: boolean;
		fieldValue?: {
			[key: string]: ProfileObject | ProfileArray | ProfileValue;
		};
		currentProfile?: ProfileObject | ProfileArray | ProfileValue | undefined;
	}

	let {
		name,
		fieldName,
		field,
		hideTitle = false,
		hideDescription = false,
		requiredFields = [],
		isParentRequired = false,
		isParentArray = false,
		fieldValue = $bindable({}),
		currentProfile = undefined
	}: Props = $props();

	const items = writable<object[]>([{}]);

	if (currentProfile && Array.isArray(currentProfile)) {
		if (typeof currentProfile[0] === 'object' && !Array.isArray(currentProfile[0])) {
			items.set(currentProfile as ProfileObject[]);
		} else {
			items.set(currentProfile.map((value) => ({ [fieldName]: value })));
			fieldValue[fieldName] = currentProfile;
		}
	} else if (currentProfile && typeof currentProfile === 'object') {
		fieldValue = { ...currentProfile };
	} else if (currentProfile !== undefined) {
		fieldValue[fieldName] = currentProfile;
	}

	if (isParentArray) {
		fieldValue[fieldName] = fieldValue[fieldName] || [];
	}

	function addItem(): void {
		items.update((currentItems) => {
			return [...currentItems, {}];
		});
	}

	function removeItem(index: number): void {
		items.update((currentItems) => {
			return currentItems.filter((_, i) => i !== index);
		});
	}

	function integrateFieldsToItems(items: Field, name?: string, description?: string): Field {
		return {
			...items,
			title: name,
			description: description
		};
	}
</script>

<div class="my-2">
	{#if field.type === 'string' && field.enum}
		<label for={name}>
			{#if !hideTitle}
				<div class="my-2 font-bold">
					{field.title}:{#if requiredFields.includes(fieldName)}
						<span class="ml-1 text-red-500">*</span>{/if}
				</div>
			{/if}
			{#if isParentArray}
				<select
					class="w-full bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
					id={name}
					{name}
					required={isParentRequired && requiredFields.includes(fieldName)}
					bind:value={fieldValue[fieldName]}
					multiple
				>
					{#each field.enum as option, index}
						<option value={option}>{field.enumNames ? field.enumNames[index] : option}</option>
					{/each}
				</select>
			{:else}
				<select
					class="w-full bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
					id={name}
					{name}
					required={isParentRequired && requiredFields.includes(fieldName)}
					bind:value={fieldValue[fieldName]}
				>
					<option value="">Select an option</option>
					{#each field.enum as option, index}
						<option value={option}>{field.enumNames ? field.enumNames[index] : option}</option>
					{/each}
				</select>
			{/if}
			{#if !hideDescription}
				<div class="text-sm text-gray-500 dark:text-gray-400">{field.description}</div>
			{/if}
		</label>
	{:else if field.type === 'string'}
		<label for={name}>
			{#if !hideTitle}
				<div class="my-2 font-bold">
					{field.title}:{#if requiredFields.includes(fieldName)}
						<span class="ml-1 text-red-500">*</span>{/if}
				</div>
			{/if}
			<input
				class="w-full bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
				type="text"
				id={name}
				{name}
				required={isParentRequired && requiredFields.includes(fieldName)}
				maxlength={field.maxLength}
				pattern={field.pattern}
				value={fieldValue[fieldName]}
			/>
			{#if !hideDescription}
				<div class="text-sm text-gray-500 dark:text-gray-400">{field.description}</div>
			{/if}
		</label>
	{:else if field.type === 'number'}
		<label for={name}>
			{#if !hideTitle}
				<div class="my-2 font-bold">
					{field.title}:{#if requiredFields.includes(fieldName)}
						<span class="ml-1 text-red-500">*</span>{/if}
				</div>
			{/if}
			<input
				class="w-full bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
				type="number"
				step="any"
				id={name}
				{name}
				required={isParentRequired && requiredFields.includes(fieldName)}
				min={field.minimum}
				max={field.maximum}
				bind:value={fieldValue[fieldName]}
			/>
			{#if !hideDescription}
				<div class="text-sm text-gray-500 dark:text-gray-400">{field.description}</div>
			{/if}
		</label>
	{:else if field.type === 'array' && field.items}
		{#if field.items.type === 'string' && field.items.enum}
			<FormField
				{name}
				{fieldName}
				field={integrateFieldsToItems(field.items, field.title, field.description)}
				{requiredFields}
				isParentRequired={requiredFields.includes(fieldName)}
				isParentArray={true}
				bind:fieldValue
			/>
		{:else}
			<fieldset class="px-4 py-0 border-4 border-dotted border-gray-500">
				<legend class="my-2 px-1 font-bold">
					{field.title}{#if requiredFields.includes(fieldName)}
						<span class="ml-1 text-red-500">*</span>{/if}
				</legend>
				<div class="text-sm text-gray-500 dark:text-gray-400">{field.description}</div>
				{#each $items as item, index (item)}
					<FormField
						name={`${name}[${index}]`}
						{fieldName}
						field={field.items}
						hideTitle={true}
						hideDescription={field.items.type !== 'object'}
						{requiredFields}
						isParentRequired={requiredFields.includes(fieldName)}
						bind:fieldValue={$items[index] as ProfileObject}
					/>
					<button
						type="button"
						class="btn-xs rounded-md text-xs font-bold md:btn-sm md:text-sm variant-filled-secondary mt-2 mb-4 py-1 px-2"
						onclick={() => removeItem(index)}>-</button
					>
				{/each}
				<button
					type="button"
					class="btn-xs rounded-md text-xs font-bold md:btn-sm md:text-sm variant-filled-primary ml-2 py-1 px-2"
					onclick={addItem}>+</button
				>
			</fieldset>
		{/if}
	{:else if field.type === 'object' && field.properties}
		<fieldset class="px-4 py-0 border-4 border-dotted border-gray-500">
			{#if !hideTitle}
				<legend class="my-2 px-1 font-bold"
					>{field.title}{#if requiredFields.includes(fieldName)}
						<span class="ml-1 text-red-500">*</span>{/if}</legend
				>
			{/if}
			{#if !hideDescription && field.description}
				<div class="text-sm text-gray-500 dark:text-gray-400">{field.description}</div>
			{/if}
			{#each Object.entries(field.properties) as [key, value]}
				<FormField
					name={name + '.' + key}
					fieldName={key}
					field={value}
					requiredFields={field.required}
					isParentRequired={requiredFields.includes(fieldName)}
					bind:fieldValue
				/>
			{/each}
		</fieldset>
	{/if}
</div>
