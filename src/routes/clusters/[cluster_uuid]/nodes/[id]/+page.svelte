<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import type { ClusterPublic } from '$lib/types/cluster';
	import type { Node } from '$lib/types/node';
	import { isValidEmail, isValidUrl } from '$lib/utils/validators';
	import { AlertCircle, ArrowLeft } from '@lucide/svelte';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let node: Node | null = $state(data?.node ?? null);
	let cluster: ClusterPublic = $state(data?.cluster);
</script>

{#if !cluster}
	<div class="flex h-32 items-center justify-center">
		<div class="text-center space-y-2">
			<AlertCircle class="h-8 w-8 text-muted-foreground mx-auto" />
			<h3 class="text-lg font-semibold">Cluster Not Found</h3>
			<p class="text-sm text-muted-foreground">The requested cluster could not be loaded.</p>
		</div>
	</div>
{:else}
	<div class="space-y-6">
		<Button variant="outline" size="sm" href="/">
			<ArrowLeft class="h-4 w-4" />
			Back to Home
		</Button>

		<div class="flex items-center justify-between">
			<div class="flex items-center gap-4">
				<h1 class="text-3xl font-bold tracking-tight">{cluster.name}</h1>
			</div>
		</div>

		{#if !node}
			<Card>
				<CardContent class="flex h-32 items-center justify-center">
					<div class="text-center space-y-2">
						<AlertCircle class="h-8 w-8 text-muted-foreground mx-auto" />
						<h3 class="text-lg font-semibold">Node Not Found</h3>
						<p class="text-sm text-muted-foreground">The requested node could not be found.</p>
					</div>
				</CardContent>
			</Card>
		{:else}
			{@const nodeData = typeof node.data === 'string' ? JSON.parse(node.data) : node.data}
			<div class="max-w-4xl mx-auto">
				<Card class="overflow-hidden">
					<CardHeader class="pb-3">
						<CardTitle class="text-2xl">
							{nodeData?.name || 'Node Details'}
						</CardTitle>
					</CardHeader>

					{#if nodeData?.image}
						<div class="px-6 pb-3">
							<img
								src={nodeData?.image}
								alt={nodeData?.name || 'Node Image'}
								class="w-full max-w-md mx-auto h-64 object-contain rounded-md border"
							/>
						</div>
					{/if}

					<CardContent class="space-y-4">
						{#if nodeData && typeof nodeData === 'object'}
							{#each Object.entries(nodeData) as [key, value]}
								{#if key !== 'image' && key !== 'name'}
									<div class="space-y-2">
										<div class="flex items-center gap-2">
											<h4 class="text-base font-medium text-foreground">{key}</h4>
										</div>
										<div class="text-sm">
											{#if Array.isArray(value)}
												{#if value.length === 1 && typeof value[0] !== 'object'}
													<span class="text-muted-foreground">{value[0]}</span>
												{:else}
													<ul class="ml-4 space-y-1 list-disc">
														{#each value as item}
															<li class="text-muted-foreground">
																{#if typeof item === 'object' && item !== null}
																	{#if Array.isArray(item)}
																		<ul class="ml-4 mt-1 list-disc space-y-1">
																			{#each item as subItem}
																				<li class="text-xs">
																					{typeof subItem === 'object' && subItem !== null
																						? JSON.stringify(subItem)
																						: subItem}
																				</li>
																			{/each}
																		</ul>
																	{:else}
																		<ul class="ml-4 mt-1 list-disc space-y-1">
																			{#each Object.entries(item) as [subKey, subValue]}
																				<li class="text-xs">
																					<span class="font-medium text-foreground">{subKey}:</span>
																					{#if Array.isArray(subValue)}
																						{#if subValue.length === 1 && typeof subValue[0] !== 'object'}
																							<span class="text-muted-foreground"
																								>{subValue[0]}</span
																							>
																						{:else}
																							<ul class="ml-4 mt-1 list-disc space-y-1">
																								{#each subValue as subSubItem}
																									<li class="text-muted-foreground">
																										{typeof subSubItem === 'object' &&
																										subSubItem !== null
																											? JSON.stringify(subSubItem)
																											: subSubItem}
																									</li>
																								{/each}
																							</ul>
																						{/if}
																					{:else if typeof subValue === 'object' && subValue !== null}
																						<span class="text-muted-foreground font-mono text-xs"
																							>{JSON.stringify(subValue)}</span
																						>
																					{:else if typeof subValue === 'string'}
																						{#if isValidUrl(subValue)}
																							<a
																								href={subValue}
																								target="_blank"
																								rel="noopener noreferrer"
																								class="underline break-words">{subValue}</a
																							>
																						{:else if isValidEmail(subValue)}
																							<a
																								href={`mailto:${subValue}`}
																								class="underline break-words">{subValue}</a
																							>
																						{:else}
																							<span class="text-muted-foreground">{subValue}</span>
																						{/if}
																					{:else}
																						<span class="text-muted-foreground">{subValue}</span>
																					{/if}
																				</li>
																			{/each}
																		</ul>
																	{/if}
																{:else}
																	{item}
																{/if}
															</li>
														{/each}
													</ul>
												{/if}
											{:else if typeof value === 'object' && value !== null}
												<ul class="ml-4 space-y-1 list-disc">
													{#each Object.entries(value) as [subKey, subValue]}
														<li class="text-xs">
															<span class="font-medium text-foreground">{subKey}:</span>
															{#if Array.isArray(subValue)}
																{#if subValue.length === 1 && typeof subValue[0] !== 'object'}
																	<span class="text-muted-foreground">{subValue[0]}</span>
																{:else}
																	<ul class="ml-4 mt-1 list-disc space-y-1">
																		{#each subValue as subSubItem}
																			<li class="text-muted-foreground">
																				{typeof subSubItem === 'object' && subSubItem !== null
																					? JSON.stringify(subSubItem)
																					: subSubItem}
																			</li>
																		{/each}
																	</ul>
																{/if}
															{:else if typeof subValue === 'object' && subValue !== null}
																<span class="text-muted-foreground font-mono text-xs"
																	>{JSON.stringify(subValue)}</span
																>
															{:else if typeof subValue === 'string'}
																{#if isValidUrl(subValue)}
																	<a
																		href={subValue}
																		target="_blank"
																		rel="noopener noreferrer"
																		class="underline break-words">{subValue}</a
																	>
																{:else if isValidEmail(subValue)}
																	<a href={`mailto:${subValue}`} class="underline break-words"
																		>{subValue}</a
																	>
																{:else}
																	<span class="text-muted-foreground">{subValue}</span>
																{/if}
															{:else}
																<span class="text-muted-foreground">{subValue}</span>
															{/if}
														</li>
													{/each}
												</ul>
											{:else if typeof value === 'string'}
												{#if isValidUrl(value)}
													<a
														href={value}
														target="_blank"
														rel="noopener noreferrer"
														class="underline break-words">{value}</a
													>
												{:else if isValidEmail(value)}
													<a href={`mailto:${value}`} class="underline break-words">{value}</a>
												{:else}
													<span class="text-muted-foreground">{value}</span>
												{/if}
											{:else}
												<span class="text-muted-foreground">{value}</span>
											{/if}
										</div>
									</div>
								{/if}
							{/each}
						{:else}
							<div class="text-center space-y-2">
								<AlertCircle class="h-8 w-8 text-muted-foreground mx-auto" />
								<h3 class="text-lg font-semibold">No Data Available</h3>
								<p class="text-sm text-muted-foreground">The node data could not be displayed.</p>
							</div>
						{/if}
					</CardContent>
				</Card>
			</div>
		{/if}
	</div>
{/if}
