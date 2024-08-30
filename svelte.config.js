import adapter from '@sveltejs/adapter-vercel';
import { sveltePreprocess } from 'svelte-preprocess';

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
		files: {
			serviceWorker: 'src/service-worker.ts'
		},
		
	},
	compilerOptions: {
		
	},
};

export default config;
