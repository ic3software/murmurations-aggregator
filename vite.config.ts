import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import devtoolsJson from 'vite-plugin-devtools-json';

export default defineConfig({
	plugins: [sveltekit(), devtoolsJson()],

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
