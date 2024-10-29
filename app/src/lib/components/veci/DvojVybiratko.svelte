<script lang="ts">
	import { onMount } from 'svelte';
	import type { Action } from 'svelte/action';
	import type { TranslationReference, Translations } from '$lib/translations';
	import { nazevSHvezdou, type DvojVybiratkova } from '$lib/Vec.svelte';

	type D = $$Generic;

	interface Props {
		t: Translations;
		vec: DvojVybiratkova<D>;
		data: D;
	}

	let { t, vec = $bindable(), data }: Props = $props();

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
		<label class="form-floating d-block left">
			<select class="form-select" value={vec.value.first ?? 'notChosen'} onchange={onChange1}>
				<option class="d-none" value="notChosen">{t.notChosen}</option>
				{#each vec.moznosti1(data) as moznost}
					<option value={moznost}>{t.get(moznost)}</option>
				{/each}
			</select>
			<label for="">{nazevSHvezdou(vec, data, t)}</label>
		</label>
		{#if vec.value.first != null}
			<select
				class="form-select right"
				id={nazevSHvezdou(vec, data, t)}
				value={vec.value.second ?? 'notChosen'}
				disabled={vec.moznosti2(data).length < 2}
				onchange={onChange2}
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
	.left {
		width: 70%;
		max-width: 70%;
	}
	.right {
		width: 30%;
	}
</style>
