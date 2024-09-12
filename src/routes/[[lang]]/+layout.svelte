<script lang="ts">
	import { dev } from '$app/environment';
	import { page } from '$app/stores';
	import Navigation from '$lib/components/Navigation.svelte';
	import { preferedLanguage } from '$lib/languages';
	import { onMount } from 'svelte';

	const t = $page.data.translations;

//	let nacita = true;
	onMount(() => {
//		nacita = false;
		// document.documentElement.setAttribute(
		// 	'data-bs-theme',
		// 	window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
		// );

		const currentLangLength = $page.params.lang?.length ?? -1;
		if (!$page.data.areTranslationsFromRoute)
			window.location.replace(
				'/' +
					preferedLanguage() +
					$page.url.pathname.slice(currentLangLength + 1) +
					$page.url.search
				// $page.route.id!.replace('[[lang]]', preferedLanguage()) + $page.url?.search ?? ''
			);

		// window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
		// 	document.documentElement.setAttribute(
		// 		'data-bs-theme',
		// 		window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
		// 	);
		// });
	});
</script>

<svelte:head>
	<!-- <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css"> -->
	<link
		href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
		rel="stylesheet"
		integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
		crossorigin="anonymous"
	/>
	<script
		src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
		integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
		crossorigin="anonymous"
	></script>
</svelte:head>

<title>{dev ? '(dev) ' : ''}{t.longAppName}</title>

<!-- {#if nacita}
	<div class="spinner-border text-danger m-2" />
{:else} -->
<Navigation {t} />
<div class="container my-3">
	<slot />
</div>

<!-- {/if} -->
