<script lang="ts">
	type D = $$Generic;
	import type { TranslationReference, Translations } from '$lib/translations';
	import { nazevSHvezdou, type Vybiratkova } from '$lib/Vec.svelte';

	interface Props {
		t: Translations;
		vec: Vybiratkova<D>;
		data: D;
	}

	let { t, vec = $bindable(), data }: Props = $props();

	const onChange = (
		e: Event & {
			currentTarget: HTMLSelectElement;
		}
	) => (vec.value = e.currentTarget.value as TranslationReference);
</script>

{#if vec.zobrazit(data)}
	<label class="form-floating d-block mb-3">
		<select class="form-select" value={vec.value ?? 'notChosen'} onchange={onChange}>
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
