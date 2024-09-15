<script lang="ts">
	import { page } from '$app/stores';
	import { relUrl } from '$lib/helpers/stores';
	import { addToHistory, history, removeFromHistory } from '$lib/History';
	import type { Translations } from '$lib/translations';
	import IMask from 'imask';
	import { inRange } from 'lodash-es';
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
	<button class="btn btn-success" type="submit" on:click={() => addToHistory(search)}
		>{t.search}</button
	>
</form>

{#if $history.length != 0}
	<h2 class="mt-2">Historie vyhledávání</h2>
	<div class="list-group list-group-flush">
		{#each $history.toReversed() as ir}
			<a
				class="list-group-item-action list-group-item d-flex align-items-center justify-content-between"
				href={$relUrl(`/detail/${ir.replace(' ', '')}`)}
				on:click={() => {
					addToHistory(ir);
				}}
			>
				{ir}
				<div class="">
					<button
						class="btn btn-outline-danger"
						on:click|stopImmediatePropagation|preventDefault={() => removeFromHistory(ir)}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							fill="currentColor"
							viewBox="0 0 16 16"
						>
							<path
								d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"
							/>
						</svg>
					</button>
				</div>
			</a>
		{/each}
	</div>
{/if}
