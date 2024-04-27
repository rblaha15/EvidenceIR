<script lang="ts">
	import { dev } from '$app/environment';
	import { onMount } from 'svelte';

	onMount(() => {
		document.documentElement.setAttribute(
			'dta-bs-theme',
			window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
		);

		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
			document.documentElement.setAttribute(
				'data-bs-theme',
				window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
			);
		});
	});
</script>

<svelte:head>
	<!-- <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css"> -->
	<link
		href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
		rel="stylesheet"
	/>

	<script
		src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
	></script>
</svelte:head>

<title>{dev ? '(dev) ' : ''}Evidence regulátorů IR</title>

<slot />
