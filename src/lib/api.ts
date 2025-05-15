export async function getCountries(
	customFetch: typeof fetch = fetch
): Promise<Record<string, string[]>> {
	const response = await customFetch('https://test-library.murmurations.network/v2/countries', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		throw new Error('Failed to fetch countries');
	}

	const data: Record<string, string[]> = await response.json();
	return data;
}
