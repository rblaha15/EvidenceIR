<script lang="ts">
	import { onMount } from 'svelte';
	import type { Action } from 'svelte/action';
	import type { TranslationReference, Translations } from '$lib/translations';
	import { nazevSHvezdou, type DvojVybiratkova } from '$lib/Vec';

	type D = $$Generic;

	export let t: Translations;
	export let vec: DvojVybiratkova<D>;
	export let data: D;

	const onChange1 = (
		e: Event & {
			currentTarget: HTMLSelectElement;
		}
	) => {
		vec.value.first = e.currentTarget.value as TranslationReference;
	};
	const onChange2 = (
		e: Event & {
			currentTarget: HTMLSelectElement;
		}
	) => (vec.value.second = e.currentTarget.value as TranslationReference);

	let mounted = false;
	onMount(() => (mounted = true));
	const Select: Action<HTMLSelectElement> = (e) => {
		if (mounted) e.showPicker();
	};
</script>

{#if vec.zobrazit(data)}
	<div class="input-group">
		<label class="form-floating d-block mw-70">
			<select class="form-select" value={vec.value.first ?? 'notChosen'} on:change={onChange1}>
				<option class="d-none" value="notChosen">{t.notChosen}</option>
				{#each vec.moznosti1(data) as moznost}
					<option value={moznost}>{t.get(moznost)}</option>
				{/each}
			</select>
			<label for="">{nazevSHvezdou(vec, data, t)}</label>
		</label>
		{#if vec.value.first != null}
			<select
				class="form-select"
				id={nazevSHvezdou(vec, data, t)}
				value={vec.value.second ?? 'notChosen'}
				on:change={onChange2}
				use:Select
			>
				<option class="d-none" value="notChosen">{t.notChosen}</option>
				{#each vec.moznosti2(data) as moznost}
					<option value={moznost}>{t.get(moznost)}</option>
				{/each}
			</select>
		{/if}
	</div>
	{#if vec.zobrazitError(data)}
		<p class="text-danger">{t.get(vec.onError(data))}</p>
	{/if}
{/if}

<style>
	.mw-70 {
		max-width: 70%;
	}
</style>
