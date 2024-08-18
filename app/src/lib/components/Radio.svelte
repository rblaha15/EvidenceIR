<script lang="ts">
	import type { Data } from '$lib/Data';
	import type { Translations } from '$lib/translations';
	import type { Radiova } from '$lib/Vec';

	export let t: Translations;
	export let vec: Radiova;
	export let data: Data;
</script>

{#if vec.zobrazit(t, data)}
	<label for={vec.nazev(t, data)}>{vec.nazev(t, data)}</label>
	{#each vec.moznosti(t, data) as moznost}
		<div class="form-check">
			<label class="form-check-label">
				{moznost}
				<input type="radio" class="form-check-input" bind:group={vec.vybrano} value={moznost} />
			</label>
		</div>
	{/each}

	{#if vec.zobrazitError(t, data)}
		<p class="text-danger">{vec.onError(t, data)}</p>
	{/if}
{/if}
