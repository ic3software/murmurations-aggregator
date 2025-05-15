<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox';

	const sourceIndexOptions = [
		{ value: 'https://index.murmurations.network/v2/nodes', label: 'Production Index' },
		{ value: 'https://test-index.murmurations.network/v2/nodes', label: 'Test Index' }
	];

	const schemaOptions = [
		{ value: 'organizations_schema-v1.0.0', label: 'An Organization' },
		{ value: 'people_schema-v0.1.0', label: 'A Person' },
		{ value: 'offers_wants_prototype-v0.0.2', label: 'An Offer or Want' }
	];

	const countryOptions = [
		{ value: 'AD', label: 'Andorra' },
		{ value: 'AE', label: 'United Arab Emirates' },
		{ value: 'AF', label: 'Afghanistan' },
		{ value: 'AG', label: 'Antigua and Barbuda' }
	];

	let clusterName = $state('');
	let clusterCenterLatitude = $state('');
	let clusterCenterLongitude = $state('');
	let clusterScale = $state('');
	let sourceIndex = $state(sourceIndexOptions[0].value);
	let schema = $state(schemaOptions[0].value);
	let filterName = $state('');
	let filterLatitude = $state('');
	let filterLongitude = $state('');
	let filterRange = $state('');
	let filterLocality = $state('');
	let filterRegion = $state('');
	let filterCountry = $state('');
	let filterTags = $state('');
	let allTags = $state(false);
	let tagsExact = $state(false);
	let primaryUrl = $state('');

	const sourceIndexTriggerContent = $derived(
		sourceIndexOptions.find((option) => option.value === sourceIndex)?.label ??
			'Select a source index'
	);

	const schemaTriggerContent = $derived(
		schemaOptions.find((option) => option.value === schema)?.label ?? 'Select a schema'
	);

	const countryTriggerContent = $derived(
		countryOptions.find((option) => option.value === filterCountry)?.label ?? 'Select a country'
	);
</script>

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

			<form class="space-y-8">
				<!-- Cluster/Directory Name -->
				<div class="space-y-2">
					<label for="cluster-name" class="text-sm font-medium leading-none"
						>Cluster/Directory Name</label
					>
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
								<label for="cluster-center-latitude" class="text-sm font-medium leading-none"
									>Cluster Center Latitude</label
								>
								<Input
									type="text"
									id="cluster-center-latitude"
									bind:value={clusterCenterLatitude}
									class="w-full"
									placeholder="Enter latitude"
								/>
							</div>

							<div class="grid gap-2">
								<label for="cluster-center-longitude" class="text-sm font-medium leading-none"
									>Cluster Center Longitude</label
								>
								<Input
									type="text"
									id="cluster-center-longitude"
									bind:value={clusterCenterLongitude}
									class="w-full"
									placeholder="Enter longitude"
								/>
							</div>

							<div class="grid gap-2">
								<label for="cluster-scale" class="text-sm font-medium leading-none"
									>Cluster Scale</label
								>
								<Input
									type="text"
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
								<label for="source-index" class="text-sm font-medium leading-none"
									>Source Index</label
								>
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
								<label for="schema" class="text-sm font-medium leading-none">Schema</label>
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
										<label for="filter-name" class="text-sm font-medium leading-none">Name</label>
										<Input
											type="text"
											id="filter-name"
											bind:value={filterName}
											class="w-full"
											placeholder="Enter name"
										/>
										<p class="text-sm text-muted-foreground">
											Search for nodes with a specific name
										</p>
									</div>

									<div class="grid gap-2">
										<label for="filter-latitude" class="text-sm font-medium leading-none"
											>Latitude</label
										>
										<Input
											type="text"
											id="filter-latitude"
											bind:value={filterLatitude}
											class="w-full"
											placeholder="Enter latitude"
										/>
										<p class="text-sm text-muted-foreground">
											Search for nodes near a specific latitude
										</p>
									</div>

									<div class="grid gap-2">
										<label for="filter-longitude" class="text-sm font-medium leading-none"
											>Longitude</label
										>
										<Input
											type="text"
											id="filter-longitude"
											bind:value={filterLongitude}
											class="w-full"
											placeholder="Enter longitude"
										/>
										<p class="text-sm text-muted-foreground">
											Search for nodes near a specific longitude
										</p>
									</div>

									<div class="grid gap-2">
										<label for="filter-range" class="text-sm font-medium leading-none"
											>Range (i.e. 25km, 15mi)</label
										>
										<Input
											type="text"
											id="filter-range"
											bind:value={filterRange}
											class="w-full"
											placeholder="Enter range"
										/>
										<p class="text-sm text-muted-foreground">
											Search for nodes within a specific distance from the latitude and longitude
											specified above
										</p>
									</div>

									<div class="grid gap-2">
										<label for="filter-locality" class="text-sm font-medium leading-none"
											>Locality</label
										>
										<Input
											type="text"
											id="filter-locality"
											bind:value={filterLocality}
											class="w-full"
											placeholder="Enter locality"
										/>
										<p class="text-sm text-muted-foreground">
											Search for nodes which list a specific locality (e.g., Paris, London, San
											Francisco, etc.)
										</p>
									</div>

									<div class="grid gap-2">
										<label for="filter-region" class="text-sm font-medium leading-none"
											>Region</label
										>
										<Input
											type="text"
											id="filter-region"
											bind:value={filterRegion}
											class="w-full"
											placeholder="Enter region"
										/>
										<p class="text-sm text-muted-foreground">
											Search for nodes which list a specific region (e.g., Île-de-France, Greater
											London, California, etc.)
										</p>
									</div>

									<div class="grid gap-2">
										<label for="filter-country" class="text-sm font-medium leading-none"
											>Country</label
										>
										<Select.Root type="single" name="filterCountry" bind:value={filterCountry}>
											<Select.Trigger class="w-full">
												{countryTriggerContent}
											</Select.Trigger>
											<Select.Content>
												<Select.Group>
													<Select.GroupHeading>Country</Select.GroupHeading>
													{#each countryOptions as option (option.value)}
														<Select.Item value={option.value} label={option.label}
															>{option.label}</Select.Item
														>
													{/each}
												</Select.Group>
											</Select.Content>
										</Select.Root>
										<p class="text-sm text-muted-foreground">
											Search for nodes which list a specific country code
										</p>
									</div>

									<div class="grid gap-2">
										<label for="filter-tags" class="text-sm font-medium leading-none">Tags</label>
										<Input
											type="text"
											id="filter-tags"
											bind:value={filterTags}
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
										<label for="all-tags" class="text-sm font-medium leading-none">All Tags</label>
									</div>
									<p class="-mt-2 text-sm text-muted-foreground">
										Only return nodes with all of the tags specified above
									</p>

									<div class="flex items-center space-x-2">
										<Checkbox id="tags-exact" bind:checked={tagsExact} class="h-4 w-4" />
										<label for="tags-exact" class="text-sm font-medium leading-none"
											>Tags Exact</label
										>
									</div>
									<p class="-mt-2 text-sm text-muted-foreground">
										Only return nodes with exact matches (turns off fuzzy matching)
									</p>

									<div class="grid gap-2">
										<label for="primary-url" class="text-sm font-medium leading-none"
											>Primary URL</label
										>
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
											>)
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="flex gap-4">
					<Button type="submit">Create</Button>
					<Button variant="secondary" href="/">Cancel</Button>
				</div>
			</form>
		</div>
	</div>
</div>
