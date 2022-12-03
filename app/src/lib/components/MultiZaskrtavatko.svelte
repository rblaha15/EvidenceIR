<script lang="ts">
	import type { MultiZaskrtavatkova } from '$lib/Vec';

	export let vec: MultiZaskrtavatkova;
</script>

{#if vec.zobrazit}
	<label for={vec.nazev}>{vec.nazev}</label>
	{#each vec.moznosti as moznost}
		<div class="form-check">
			<label class="form-check-label">
				{moznost}
				<input type="checkbox" class="form-check-input" bind:group={vec.vybrano} value={moznost} />
			</label>
		</div>
	{/each}

	{#if vec.zobrazitError}
		<p class="text-danger">{vec.onError}</p>
	{/if}
{/if}
