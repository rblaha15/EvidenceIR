<script lang="ts">
	import { page } from '$app/stores';
	import { relUrl } from '$lib/helpers/stores';
	import type { Translations } from '$lib/translations';
	import IMask from 'imask';
	import { onMount } from 'svelte';

	let nacita = true;
	onMount(() => (nacita = false));

	const t: Translations = $page.data.translations;

	let input: HTMLInputElement | undefined;
	$: mask =
		input == undefined
			? undefined
			: IMask(input, {
					mask: 'A1 0000',
					definitions: {
						A: /[A-Z]/,
						'1': /[1-9OND]/
					}
				});

	onMount(() => {
		return () => {
			input = undefined;
		};
	});

	let search = '';

	$: mask?.on('accept', (_) => (search = mask.value));
</script>

<h1>{t.controllerSearch}</h1>
<form class="d-flex" role="search" action={$relUrl(`/detail/${search.replace(' ', '')}`)}>
	<input type="search" class="form-control me-2" placeholder={t.serialNumber} bind:this={input} />
	<button class="btn btn-success" type="submit">{t.search}</button>
</form>
