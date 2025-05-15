<script lang="ts">
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { ChevronsUpDown, Check } from '@lucide/svelte';
	import { Label } from '$lib/components/ui/label';
	import { tick } from 'svelte';
	import { cn } from '$lib/utils';
	import type { PageProps } from './$types';
	import type { ClusterRequest } from '$lib/types/cluster';
	import { createCluster } from '$lib/api';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	let { data }: PageProps = $props();

	const sourceIndexOptions = [
		{ value: 'https://index.murmurations.network/v2/nodes', label: 'Production Index' },
		{ value: 'https://test-index.murmurations.network/v2/nodes', label: 'Test Index' }
	];

	const schemaOptions = [
		{ value: 'organizations_schema-v1.0.0', label: 'An Organization' },
		{ value: 'people_schema-v0.1.0', label: 'A Person' },
		{ value: 'offers_wants_prototype-v0.0.2', label: 'An Offer or Want' }
	];

	const countryOptions = data?.countries ?? [];

	let clusterName = $state('');
	let clusterCenterLatitude = $state(0);
	let clusterCenterLongitude = $state(0);
	let clusterScale = $state(5);
	let sourceIndex = $state(sourceIndexOptions[0].value);
	let schema = $state(schemaOptions[0].value);
	let name = $state('');
	let latitude = $state(0);
	let longitude = $state(0);
	let range = $state('');
	let locality = $state('');
	let region = $state('');
	let country = $state('');
	let tags = $state('');
	let allTags = $state(false);
	let tagsExact = $state(false);
	let primaryUrl = $state('');

	let countrySearchOpen = $state(false);
	let countrySearchResults = $state<{ label: string; value: string }[]>(data?.countries);
	let triggerRef = $state<HTMLButtonElement>(null!);

	let isCreatingCluster = $state(false);

	const sourceIndexTriggerContent = $derived(
		sourceIndexOptions.find((option) => option.value === sourceIndex)?.label ??
			'Select a source index'
	);

	const schemaTriggerContent = $derived(
		schemaOptions.find((option) => option.value === schema)?.label ?? 'Select a schema'
	);

	function searchCountries(query: string) {
		countrySearchResults = countryOptions.filter((option) =>
			option.label.toLowerCase().includes(query.toLowerCase())
		);
	}

	function closeAndFocusCountryTrigger() {
		countrySearchOpen = false;
		tick().then(() => {
			triggerRef?.focus();
		});
	}

	async function submitCluster(event: Event) {
		event.preventDefault();

		isCreatingCluster = true;

		try {
			const queryParams = buildQueryParams();
			const pageQueries = 'page=1&page_size=500';
			const queryString = [...queryParams, pageQueries].join('&');
			const urlWithParams = `${sourceIndex}?${queryString}`;

			console.log('urlWithParams', urlWithParams);

			const clusterData: ClusterRequest = {
				name: clusterName,
				indexUrl: sourceIndex,
				queryUrl: `?${queryString}`,
				centerLat: clusterCenterLatitude,
				centerLon: clusterCenterLongitude,
				scale: clusterScale
			};
			const response = await createCluster(clusterData);

			console.log('response', response);

			if (response?.success) {
				toast.success('Cluster created successfully');
				goto('/');
			} else {
				toast.error('Error creating cluster');
			}
		} catch (error) {
			console.error('Error creating cluster:', error);
			toast.error('Error creating cluster');
		} finally {
			isCreatingCluster = false;
		}
	}

	function buildQueryParams() {
		const queryParams: string[] = [];

		if (schema) queryParams.push(`schema=${encodeURIComponent(schema)}`);
		if (name) queryParams.push(`name=${encodeURIComponent(name)}`);
		if (latitude) queryParams.push(`latitude=${encodeURIComponent(latitude)}`);
		if (longitude) queryParams.push(`longitude=${encodeURIComponent(longitude)}`);
		if (range) queryParams.push(`range=${encodeURIComponent(range)}`);
		if (locality) queryParams.push(`locality=${encodeURIComponent(locality)}`);
		if (region) queryParams.push(`region=${encodeURIComponent(region)}`);
		if (country) queryParams.push(`country=${encodeURIComponent(country)}`);
		if (primaryUrl) queryParams.push(`primary_url=${encodeURIComponent(primaryUrl)}`);

		// Tags handling
		if (tags) {
			queryParams.push(`tags=${encodeURIComponent(tags)}`);
			queryParams.push(`operator=${allTags ? 'and' : 'or'}`);
		}

		// Tags exact matching
		if (tagsExact) {
			queryParams.push('tags_exact=true');
		}

		return queryParams;
	}
</script>

<svelte:head>
	<title>Create a Cluster | Murmurations Collaborative Cluster Builder</title>
</svelte:head>

<div class="min-h-screen bg-background text-foreground">
	<div class="container mx-auto px-4 py-8">
		<header class="mb-8">
			<h1 class="mb-6 text-3xl font-bold text-slate-900 dark:text-slate-50">
				Murmurations Collaborative Cluster Builder
			</h1>
		</header>

		<div class="mx-auto max-w-none">
			<h2 class="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-50">
				Create a Cluster or Directory
			</h2>
			<p class="mb-8 text-slate-700 dark:text-slate-300">
				Import nodes from the distributed Murmurations network to create your own custom clusters
				and directories.
			</p>

			<form class="space-y-8" onsubmit={submitCluster}>
				<!-- Cluster/Directory Name -->
				<div class="space-y-2">
					<Label for="cluster-name">Cluster/Directory Name</Label>
					<Input
						type="text"
						id="cluster-name"
						bind:value={clusterName}
						class="w-full"
						placeholder="Enter cluster or directory name"
					/>
					<p class="text-sm text-muted-foreground">
						A familiar name to make it easy for you to identify
					</p>
				</div>

				<!-- Cluster Settings -->
				<div class="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
					<div class="flex flex-col space-y-1.5 p-0">
						<h3 class="text-2xl font-semibold leading-none tracking-tight">Cluster Settings</h3>
					</div>
					<div class="p-0 pt-4">
						<p class="mb-4 leading-7">
							Use <a
								href="https://latlong.net"
								target="_blank"
								class="font-medium text-primary underline underline-offset-4">LatLong.net</a
							> to pick a location, enter coordinates with decimals (e.g., 48.86124)
						</p>

						<div class="grid gap-4">
							<div class="grid gap-2">
								<Label for="cluster-center-latitude">Cluster Center Latitude</Label>
								<Input
									type="number"
									min="-90"
									max="90"
									step="0.000001"
									id="cluster-center-latitude"
									bind:value={clusterCenterLatitude}
									class="w-full"
									placeholder="Enter latitude"
								/>
							</div>

							<div class="grid gap-2">
								<Label for="cluster-center-longitude">Cluster Center Longitude</Label>
								<Input
									type="number"
									min="-180"
									max="180"
									step="0.000001"
									id="cluster-center-longitude"
									bind:value={clusterCenterLongitude}
									class="w-full"
									placeholder="Enter longitude"
								/>
							</div>

							<div class="grid gap-2">
								<Label for="cluster-scale">Cluster Scale</Label>
								<Input
									type="number"
									min="1"
									max="18"
									step="1"
									id="cluster-scale"
									bind:value={clusterScale}
									class="w-full"
									placeholder="Enter cluster scale"
								/>
								<p class="text-sm text-muted-foreground">
									1 = the entire globe, 18 = maximum zoom in
								</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Node Selection -->
				<div class="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
					<div class="flex flex-col space-y-1.5 p-0">
						<h3 class="text-2xl font-semibold leading-none tracking-tight">Node Selection</h3>
					</div>
					<div class="p-0 pt-4">
						<div class="grid gap-4">
							<div class="grid gap-2">
								<Label for="source-index">Source Index</Label>
								<Select.Root type="single" name="sourceIndex" bind:value={sourceIndex}>
									<Select.Trigger class="w-full">
										{sourceIndexTriggerContent}
									</Select.Trigger>
									<Select.Content>
										<Select.Group>
											<Select.GroupHeading>Source Index</Select.GroupHeading>
											{#each sourceIndexOptions as option (option.value)}
												<Select.Item value={option.value} label={option.label}
													>{option.label}</Select.Item
												>
											{/each}
										</Select.Group>
									</Select.Content>
								</Select.Root>
								<p class="text-sm text-muted-foreground">
									Select the test or production index to find nodes for your cluster or directory
								</p>
							</div>

							<div class="grid gap-2">
								<Label for="schema">Schema</Label>
								<Select.Root type="single" name="schema" bind:value={schema}>
									<Select.Trigger class="w-full">
										{schemaTriggerContent}
									</Select.Trigger>
									<Select.Content>
										<Select.Group>
											<Select.GroupHeading>Schema</Select.GroupHeading>
											{#each schemaOptions as option (option.value)}
												<Select.Item value={option.value} label={option.label}
													>{option.label}</Select.Item
												>
											{/each}
										</Select.Group>
									</Select.Content>
								</Select.Root>
								<p class="text-sm text-muted-foreground">
									Select a schema to specify the type of nodes you want to display
								</p>
							</div>

							<div class="pt-2">
								<h4 class="mb-4 text-base font-medium">
									Filter the number of nodes returned from the index using the optional fields below
								</h4>

								<div class="grid gap-4">
									<div class="grid gap-2">
										<Label for="name">Name</Label>
										<Input
											type="text"
											id="name"
											bind:value={name}
											class="w-full"
											placeholder="Enter name"
										/>
										<p class="text-sm text-muted-foreground">
											Search for nodes with a specific name
										</p>
									</div>

									<div class="grid gap-2">
										<Label for="latitude">Latitude</Label>
										<Input
											type="number"
											min="-90"
											max="90"
											step="0.000001"
											id="latitude"
											bind:value={latitude}
											class="w-full"
											placeholder="Enter latitude"
										/>
										<p class="text-sm text-muted-foreground">
											Search for nodes near a specific latitude
										</p>
									</div>

									<div class="grid gap-2">
										<Label for="longitude">Longitude</Label>
										<Input
											type="number"
											min="-180"
											max="180"
											step="0.000001"
											id="longitude"
											bind:value={longitude}
											class="w-full"
											placeholder="Enter longitude"
										/>
										<p class="text-sm text-muted-foreground">
											Search for nodes near a specific longitude
										</p>
									</div>

									<div class="grid gap-2">
										<Label for="range">Range (i.e. 25km, 15mi)</Label>
										<Input
											type="text"
											id="range"
											bind:value={range}
											class="w-full"
											placeholder="Enter range"
										/>
										<p class="text-sm text-muted-foreground">
											Search for nodes within a specific distance from the latitude and longitude
											specified above
										</p>
									</div>

									<div class="grid gap-2">
										<Label for="locality">Locality</Label>
										<Input
											type="text"
											id="locality"
											bind:value={locality}
											class="w-full"
											placeholder="Enter locality"
										/>
										<p class="text-sm text-muted-foreground">
											Search for nodes which list a specific locality (e.g., Paris, London, San
											Francisco, etc.)
										</p>
									</div>

									<div class="grid gap-2">
										<Label for="region">Region</Label>
										<Input
											type="text"
											id="region"
											bind:value={region}
											class="w-full"
											placeholder="Enter region"
										/>
										<p class="text-sm text-muted-foreground">
											Search for nodes which list a specific region (e.g., Île-de-France, Greater
											London, California, etc.)
										</p>
									</div>

									<div class="grid gap-2">
										<Label for="country" class="block text-sm font-medium">Country</Label>
										<div class="relative">
											<Popover.Root bind:open={countrySearchOpen}>
												<Popover.Trigger bind:ref={triggerRef}>
													{#snippet child({ props })}
														<Button
															variant="outline"
															class="w-full justify-between"
															{...props}
															role="combobox"
															aria-expanded={countrySearchOpen}
														>
															{country ? country : 'Select a country'}
															<ChevronsUpDown class="opacity-50" />
														</Button>
													{/snippet}
												</Popover.Trigger>
												<Popover.Content class="w-[400px] p-0">
													<Command.Root shouldFilter={false}>
														<Command.Input
															placeholder="Search countries..."
															oninput={(e) => searchCountries(e.currentTarget.value)}
														/>
														<Command.List>
															<Command.Empty>No countries found.</Command.Empty>
															<Command.Group>
																{#each countrySearchResults as result}
																	<Command.Item
																		value={result.value}
																		onSelect={() => {
																			country = result.value;
																			closeAndFocusCountryTrigger();
																		}}
																	>
																		<Check
																			class={cn(country !== result.value && 'text-transparent')}
																		/>
																		<div>
																			<div>{result.label}</div>
																		</div>
																	</Command.Item>
																{/each}
															</Command.Group>
														</Command.List>
													</Command.Root>
												</Popover.Content>
											</Popover.Root>
										</div>
										<p class="text-sm text-muted-foreground">
											Search for nodes which list a specific country code
										</p>
									</div>

									<div class="grid gap-2">
										<Label for="tags">Tags</Label>
										<Input
											type="text"
											id="tags"
											bind:value={tags}
											class="w-full"
											placeholder="Enter tags"
										/>
										<p class="text-sm text-muted-foreground">
											Search for nodes which list specific tags (use commas to search for multiple
											tags)
										</p>
									</div>

									<div class="flex items-center space-x-2">
										<Checkbox id="all-tags" bind:checked={allTags} class="h-4 w-4" />
										<Label for="all-tags">All Tags</Label>
									</div>
									<p class="-mt-2 text-sm text-muted-foreground">
										Only return nodes with all of the tags specified above
									</p>

									<div class="flex items-center space-x-2">
										<Checkbox id="tags-exact" bind:checked={tagsExact} class="h-4 w-4" />
										<Label for="tags-exact">Tags Exact</Label>
									</div>
									<p class="-mt-2 text-sm text-muted-foreground">
										Only return nodes with exact matches (turns off fuzzy matching)
									</p>

									<div class="grid gap-2">
										<Label for="primary-url">Primary URL</Label>
										<Input
											type="text"
											id="primary-url"
											bind:value={primaryUrl}
											class="w-full"
											placeholder="Enter primary URL"
										/>
										<p class="text-sm text-muted-foreground">
											Search for nodes with a specific primary URL (don't include http or www, e.g., <code
												class="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm"
												>my.org</code
											>
											or
											<code
												class="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm"
												>some-host.net/my-org</code
											>
											)
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="flex gap-4">
					{#if isCreatingCluster}
						<Button disabled>
							<LoaderCircle class="animate-spin" />
							Please wait
						</Button>
					{:else}
						<Button type="submit">Create</Button>
					{/if}
					<Button variant="secondary" href="/">Cancel</Button>
				</div>
			</form>
		</div>
	</div>
</div>
