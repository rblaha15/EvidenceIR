<script lang="ts">
	type D = $$Generic;
	import type { Translations } from '$lib/translations';
	import { nazevSHvezdou, type MultiZaskrtavatkova } from '$lib/Vec.svelte';

	interface Props {
		t: Translations;
		vec: MultiZaskrtavatkova<D>;
		data: D;
	}

	let { t, vec = $bindable(), data }: Props = $props();
</script>

{#if vec.zobrazit(data)}
	<label for="">{nazevSHvezdou(vec, data, t)}</label>
	{#each vec.moznosti(data) as moznost}
		<div class="form-check">
			<label class="form-check-label">
				{t.get(moznost)}
				<input type="checkbox" class="form-check-input" value={moznost} bind:group={vec.value} />
			</label>
		</div>
	{/each}

	{#if vec.zobrazitError(data)}
		<p class="text-danger">{t.get(vec.onError(data))}</p>
	{/if}
{/if}
