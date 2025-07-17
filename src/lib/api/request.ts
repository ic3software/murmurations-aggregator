import type { Meta } from '$lib/types/api';
import type { ValidationError } from '$lib/types/profile';

export async function request<TBody, TResponse>(
	url: string,
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
	body?: TBody,
	customFetch: typeof fetch = fetch,
	token?: string
): Promise<{
	data: TResponse;
	success: boolean;
	message?: string;
	error?: string;
	meta?: Meta;
	errors?: ValidationError[];
}> {
	try {
		const headers: HeadersInit = {
			'Content-Type': 'application/json'
		};

		const requestBody = body !== undefined ? JSON.stringify(body) : undefined;

		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}

		const response = await customFetch(url, {
			method,
			headers,
			body: requestBody
		});

		const json = await response.json();

		if (!response.ok) {
			return {
				data: null as unknown as TResponse,
				success: false,
				message: json?.message,
				error: json?.error,
				meta: json?.meta,
				errors: json?.errors
			};
		}

		return json;
	} catch (error) {
		console.error(`Error on request to ${url}:`, error);
		throw error;
	}
}
