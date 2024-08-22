<script lang="ts">
	import type { Data } from '$lib/Data';
	import type { Translations } from '$lib/translations';
	import { nazevSHvezdou, type MultiZaskrtavatkova } from '$lib/Vec';

	export let t: Translations
	export let vec: MultiZaskrtavatkova;
	export let data: Data;
</script>

{#if vec.zobrazit({ t, data })}
	<label for="">{nazevSHvezdou(vec, { t, data })}</label>
	{#each vec.moznosti({ t, data }) as moznost, i}
		<div class="form-check">
			<label class="form-check-label">
				{moznost}
				<input type="checkbox" class="form-check-input" value={i} bind:group={vec.vybrano} />
			</label>
		</div>
	{/each}

	{#if vec.zobrazitError({ t, data })}
		<p class="text-danger">{vec.onError({ t, data })}</p>
	{/if}
{/if}
