import adapter from '@sveltejs/adapter-node';
import { sveltePreprocess } from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: sveltePreprocess({
		preserve: ['module']
	}),
	kit: {
		adapter: adapter({
			out: 'dist'
		}),
		// files: {
		// 	serviceWorker: 'src/service-worker.ts'
		// },
		
	},
	compilerOptions: {
		
	},
};

export default config;
