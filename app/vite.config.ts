import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import pkg from './package.json';

export default defineConfig({
    plugins: [tailwindcss(), sveltekit()],
    server: {
        port: 5006,
        strictPort: true,
    },
    preview: {
        port: 4006,
    },
    define: {
        appVersion: JSON.stringify(pkg.version),
    },
    envDir: '../',
    envPrefix: 'PUBLIC_',
});
