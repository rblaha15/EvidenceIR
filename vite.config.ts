import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import pkg from './package.json';

const config: UserConfig = {
	plugins: [
		sveltekit(),
	],
	define: {
		appVersion: JSON.stringify(pkg.version),
	},
	server: {
		port: 5001,
		strictPort: true,
	},
	preview: {
		port: 4001,
	},
};

export default config;
