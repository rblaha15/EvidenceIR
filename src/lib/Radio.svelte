<script lang="ts">
	import type { Vec } from './Vec';

	export let vec: Vec;

</script>

{#if vec.zobrazit}
	<label for={vec.nazev}>{vec.nazev}</label>

	{#each vec.moznosti as moznost, i}
		<div class="form-check">
			<input type="radio" class="form-check-input" id={moznost} bind:group={vec.vybrano} value={moznost} />
			<label class="form-check-label" for={moznost}>{moznost}</label>
		</div>
	{/each}

	{#if vec.zobrazitError}
		<p class="text-danger">{vec.onError}</p>
	{/if}
{/if}
