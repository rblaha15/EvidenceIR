<script lang="ts">
	import { page } from '$app/stores';
	import Navigation from '$lib/components/Navigation.svelte';
	import { relUrl } from '$lib/constants';
	import type { Translations } from '$lib/translations';
	import IMask, { InputMask } from 'imask';
	import { onDestroy, onMount } from 'svelte';

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

{#if nacita}
	<div class="spinner-border text-danger" />
{:else}
	<Navigation {t} />
	<main class="container my-3">
		<h1>{t.controllerSearch}</h1>
		<form class="d-flex" role="search">
			<input
				type="search"
				class="form-control me-2"
				placeholder={t.serialNumber}
				bind:this={input}
			/>
			<a class="btn btn-success" href={$relUrl(`/detail/${search.replace(' ', '')}`)}>{t.search}</a>
		</form>
	</main>
{/if}
