<script lang="ts">
	type D = $$Generic;
	import type { Translations } from '$lib/translations';
	import { nazevSHvezdou, type Prepinatkova } from '$lib/Vec.svelte';

	interface Props {
		t: Translations;
		vec: Prepinatkova<D>;
		data: D;
	}

	let { t, vec = $bindable(), data }: Props = $props();
</script>

{#if vec.zobrazit(data)}
	<div class="d-flex align-items-center mb-3">
		<label class="me-2" for="">{nazevSHvezdou(vec, data, t)}</label>
		<div class="btn-group" role="group">
			{#each vec.moznosti as moznost, i}
				<input
					type="radio"
					class="btn-check"
					bind:group={vec.value}
					value={Boolean(i)}
					id={vec.nazev(data) + Boolean(i)}
					autocomplete="off"
				/>
				<label class="btn btn-sm {vec.hasPositivity(data) && vec.value === Boolean(i) ? i === 1 ? 'btn-outline-success' : 'btn-outline-danger' : 'btn-outline-secondary'}" for={vec.nazev(data) + Boolean(i)}
					>{t.get(moznost)}</label
				>
			{/each}
		</div>
	</div>

	{#if vec.zobrazitError(data)}
		<p class="text-danger">{t.get(vec.onError(data))}</p>
	{/if}
{/if}
