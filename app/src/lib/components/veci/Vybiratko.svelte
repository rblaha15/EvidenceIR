<script lang="ts">
	type D = $$Generic;
	import type { TranslationReference, Translations } from '$lib/translations';
	import { nazevSHvezdou, type Vybiratkova } from '$lib/Vec';

	export let t: Translations;
	export let vec: Vybiratkova<D>;
	export let data: D;

	const onChange = (
		e: Event & {
			currentTarget: HTMLSelectElement;
		}
	) => (vec.value = e.currentTarget.value as TranslationReference);
</script>

{#if vec.zobrazit(data)}
	<label class="form-floating d-block">
		<select class="form-select" value={vec.value ?? 'notChosen'} on:change={onChange}>
			<option class="d-none" value='notChosen'>{t.notChosen}</option>
			{#each vec.moznosti(data) as moznost}
				<option value={moznost}>{t.get(moznost)}</option>
			{/each}
		</select>
		<label for="">{nazevSHvezdou(vec, data, t)}</label>
	</label>

	{#if vec.zobrazitError(data)}
		<p class="text-danger">{t.get(vec.onError(data))}</p>
	{/if}
{/if}
