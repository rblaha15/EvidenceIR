<script lang="ts">
	import { dev } from '$app/environment';
	import { page } from '$app/stores';
	import { checkAuth } from '$lib/client/auth';
	import Navigation from '$lib/components/Navigation.svelte';
	import { preferedLanguage } from '$lib/languages';
	import { onMount, type Snippet } from 'svelte';
	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();

	const t = $page.data.translations;

	let nacita = $state(true);
	onMount(async () => {
		await checkAuth();
		nacita = false;
	});
	onMount(() => {
		import('bootstrap');
		const currentLangLength = $page.params.lang?.length ?? -1;
		if (!$page.data.areTranslationsFromRoute)
			window.location.replace(
				'/' +
					preferedLanguage() +
					$page.url.pathname.slice(currentLangLength + 1) +
					$page.url.search
			);
	});
</script>

<svelte:head>
	<style lang="scss">
		@import 'bootstrap/scss/bootstrap';
	</style>
</svelte:head>

<title>{dev ? '(dev) ' : ''}{t.longAppName}</title>

{#if nacita}
	<div class="spinner-border text-danger m-2"></div>
{:else}
	<Navigation {t} />
	<div class="container my-3">
		{@render children?.()}
	</div>
{/if}
