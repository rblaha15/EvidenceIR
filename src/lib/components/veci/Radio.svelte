<script lang="ts">
	import type { Data } from '$lib/Data';
	import type { Translations } from '$lib/translations';
	import { nazevSHvezdou, type Radiova } from '$lib/Vec';

	export let t: Translations;
	export let vec: Radiova;
	export let data: Data;
</script>

{#if vec.zobrazit(data)}
	<label for="">{nazevSHvezdou(vec, data, t)}</label>
	{#each vec.moznosti(data) as moznost}
		<div class="form-check">
			<label class="form-check-label">
				{t.get(moznost)}
				<input type="radio" class="form-check-input" bind:group={vec.value} value={moznost} />
			</label>
		</div>
	{/each}

	{#if vec.zobrazitError(data)}
		<p class="text-danger">{t.get(vec.onError(data))}</p>
	{/if}
{/if}
