import adapter from '@sveltejs/adapter-vercel';
import { sveltePreprocess } from 'svelte-preprocess';
import { execSync } from 'node:child_process';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: sveltePreprocess({
		preserve: ['module']
	}),
	onwarn: (warning, handler) => {
		if (warning.code === 'css-unused-selector') {
			return;
		}
		handler(warning);
	},
	kit: {
		adapter: adapter({
			split: true
		}),
		version: {
			name: execSync('git rev-parse HEAD').toString().trim()
		}
	},
	compilerOptions: {}
};

export default config;
