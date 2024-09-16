<script lang="ts">
	import { goto } from '$app/navigation';
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
	let error = '';
	$: search, (error = '');

	$: mask?.on('accept', (_) => (search = mask.value));
</script>

<h1>{t.controllerSearch}</h1>
<form>
	<div class="d-flex align-items-center">
		<label class="form-floating me-2 flex-grow-1">
			<input
				type="search"
				class:is-invalid={error != ''}
				class="form-control"
				placeholder={t.serialNumber}
				bind:this={input}
				required
			/>
			<label for="">{t.search}</label>
			<div class="invalid-feedback" class:d-block={true}>
				{error}
			</div>
		</label>
		<a
			class="btn btn-success"
			type="submit"
			href={$relUrl(`/detail/${search.replace(' ', '')}`)}
			on:click|preventDefault={() => {
				if (!/([A-Z][1-9OND]) ([0-9]{4})/.test(search)) {
					error = t.wrongNumberFormat;
					return;
				}
				addToHistory(search);
			}}>{t.search}</a
		>
	</div>
</form>

{#if $history.length != 0}
	<h2 class="mt-2">Historie vyhledávání</h2>
	<div class="list-group list-group-flush">
		{#each $history.toReversed() as ir}
			<a
				class="list-group-item-action list-group-item d-flex align-items-center justify-content-between"
				href={$relUrl(`/detail/${ir.replace(' ', '')}`)}
				on:click|preventDefault={() => {
					addToHistory(ir);
					goto($relUrl(`/detail/${ir.replace(' ', '')}`));
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
