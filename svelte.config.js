import adapter from '@sveltejs/adapter-node';
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
			out: 'dist'
		}),
		version: {
			name: execSync('git rev-parse HEAD').toString().trim()
		},
		csrf: {
			checkOrigin: false,
		}
	},
	compilerOptions: {},
};

export default config;
