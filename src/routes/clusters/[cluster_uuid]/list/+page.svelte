<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { AlertCircle, ArrowLeft, Database } from '@lucide/svelte';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const { nodes, cluster } = data;
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

		{#if !nodes || nodes.length === 0}
			<Card>
				<CardContent class="flex h-32 items-center justify-center">
					<div class="text-center space-y-2">
						<Database class="h-8 w-8 text-muted-foreground mx-auto" />
						<h3 class="text-lg font-semibold">No Data Available</h3>
						<p class="text-sm text-muted-foreground">This cluster doesn't contain any data yet.</p>
					</div>
				</CardContent>
			</Card>
		{:else}
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each nodes as node, index}
					{@const nodeData = typeof node.data === 'string' ? JSON.parse(node.data) : node.data}
					<Card class="overflow-hidden">
						<CardHeader class="pb-3">
							<CardTitle class="text-lg">
								{nodeData.name || `Item #${index + 1}`}
							</CardTitle>
						</CardHeader>

						{#if nodeData.image}
							<div class="px-6 pb-3">
								<img
									src={nodeData.image}
									alt={nodeData.name || `Item #${index + 1}`}
									class="w-full h-48 object-cover rounded-md border"
								/>
							</div>
						{/if}

						<CardContent class="space-y-3">
							{#each Object.entries(nodeData) as [key, value]}
								{#if key !== 'image' && key !== 'name'}
									<div class="space-y-1">
										<div class="flex items-center gap-2">
											<h4 class="text-sm font-medium text-foreground">{key}</h4>
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
															{:else}
																<span class="text-muted-foreground">{subValue}</span>
															{/if}
														</li>
													{/each}
												</ul>
											{:else}
												<span class="text-muted-foreground">{value}</span>
											{/if}
										</div>
									</div>
								{/if}
							{/each}
						</CardContent>
					</Card>
				{/each}
			</div>
		{/if}
	</div>
{/if}
