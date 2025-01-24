<script lang="ts">
	import { dev } from '$app/environment';
	import { page } from '$app/state';
	import { checkAuth } from '$lib/client/auth';
	import Navigation from '$lib/components/Navigation.svelte';
	import { preferredLanguage } from '$lib/languages';
	import { onMount, type Snippet } from 'svelte';
	import { titleSvelte } from '$lib/helpers/title.svelte';
	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();

	const t = page.data.translations;

	let nacita = $state(true);
	onMount(async () => {
		await checkAuth();
		nacita = false;
	});
	onMount(() => {
		import('bootstrap');
		const currentLangLength = page.params.lang?.length ?? -1;
		if (!page.data.areTranslationsFromRoute)
			window.location.replace(
				'/' +
					preferredLanguage() +
					page.url.pathname.slice(currentLangLength + 1) +
					page.url.search
			);
	});
</script>

<svelte:head>
	<style lang="scss">
		@import 'bootstrap/scss/bootstrap';
	</style>

	<title>{dev ? '(dev) ' : ''}SEIR :: {$titleSvelte}</title>
</svelte:head>

{#if nacita}
	<div class="spinner-border text-danger m-2"></div>
{:else}
	<Navigation {t} />
	<div class="container my-3">
		<h1>{$titleSvelte}</h1>
		{@render children?.()}
	</div>
{/if}
