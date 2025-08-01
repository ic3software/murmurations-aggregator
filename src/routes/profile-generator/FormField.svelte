<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
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

<div class="space-y-4">
	{#if field.type === 'string' && field.enum}
		<div class="space-y-2">
			{#if !hideTitle}
				<div class="flex items-center gap-2">
					<Label for={name} class="text-sm font-medium">
						{field.title}
					</Label>
					{#if requiredFields.includes(fieldName)}
						<Badge variant="destructive" class="text-[10px] px-1.5 py-0.5 h-4">Required</Badge>
					{/if}
				</div>
			{/if}
			{#if isParentArray}
				<select
					class="flex h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
			{#if !hideDescription && field.description}
				<p class="text-sm text-muted-foreground">{field.description}</p>
			{/if}
		</div>
	{:else if field.type === 'string'}
		<div class="space-y-2">
			{#if !hideTitle}
				<div class="flex items-center gap-2">
					<Label for={name} class="text-sm font-medium">
						{field.title}
					</Label>
					{#if requiredFields.includes(fieldName)}
						<Badge variant="destructive" class="text-[10px] px-1.5 py-0.5 h-4">Required</Badge>
					{/if}
				</div>
			{/if}
			<Input
				type="text"
				id={name}
				{name}
				required={isParentRequired && requiredFields.includes(fieldName)}
				maxlength={field.maxLength}
				pattern={field.pattern}
				bind:value={fieldValue[fieldName]}
				class="w-full"
			/>
			{#if !hideDescription && field.description}
				<p class="text-sm text-muted-foreground">{field.description}</p>
			{/if}
		</div>
	{:else if field.type === 'number'}
		<div class="space-y-2">
			{#if !hideTitle}
				<div class="flex items-center gap-2">
					<Label for={name} class="text-sm font-medium">
						{field.title}
					</Label>
					{#if requiredFields.includes(fieldName)}
						<Badge variant="destructive" class="text-[10px] px-1.5 py-0.5 h-4">Required</Badge>
					{/if}
				</div>
			{/if}
			<Input
				type="number"
				step="any"
				id={name}
				{name}
				required={isParentRequired && requiredFields.includes(fieldName)}
				min={field.minimum}
				max={field.maximum}
				bind:value={fieldValue[fieldName]}
				class="w-full"
			/>
			{#if !hideDescription && field.description}
				<p class="text-sm text-muted-foreground">{field.description}</p>
			{/if}
		</div>
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
			<Card class="border-dashed border-2">
				<CardHeader class="pb-3">
					<div class="flex items-center gap-2">
						<CardTitle class="text-base font-medium">
							{field.title}
						</CardTitle>
						{#if requiredFields.includes(fieldName)}
							<Badge variant="destructive" class="text-[10px] px-1.5 py-0.5 h-4">Required</Badge>
						{/if}
					</div>
					{#if field.description}
						<CardDescription class="text-sm">{field.description}</CardDescription>
					{/if}
				</CardHeader>
				<CardContent class="space-y-4">
					{#each $items as item, index (item)}
						<div class="space-y-2 p-4 border rounded-lg">
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
							<Button
								type="button"
								variant="destructive"
								size="sm"
								onclick={() => removeItem(index)}
								class="mt-2 text-xs"
							>
								Remove
							</Button>
						</div>
					{/each}
					<Button type="button" variant="outline" size="sm" onclick={addItem} class="w-full">
						Add Item
					</Button>
				</CardContent>
			</Card>
		{/if}
	{:else if field.type === 'object' && field.properties}
		<Card class="border-dashed border-2">
			{#if !hideTitle}
				<CardHeader class="pb-3">
					<div class="flex items-center gap-2">
						<CardTitle class="text-base font-medium">
							{field.title}
						</CardTitle>
						{#if requiredFields.includes(fieldName)}
							<Badge variant="destructive" class="text-[10px] px-1.5 py-0.5 h-4">Required</Badge>
						{/if}
					</div>
					{#if !hideDescription && field.description}
						<CardDescription class="text-sm">{field.description}</CardDescription>
					{/if}
				</CardHeader>
			{/if}
			<CardContent class="space-y-4">
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
			</CardContent>
		</Card>
	{/if}
</div>
