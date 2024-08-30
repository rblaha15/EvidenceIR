import adapter from '@sveltejs/adapter-vercel';

import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess({
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
		})
	}
};

export default config;
