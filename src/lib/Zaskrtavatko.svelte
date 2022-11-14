<script lang="ts">
	import type { Vec } from './Vec';

	export let vec: Vec;
</script>

{#if vec.zobrazit}
	<div class="form-check" >
		<input class="form-check-input" type="checkbox" id={vec.nazev} bind:checked={vec.bool} />
		<label class="form-check-label" for={vec.nazev}>{vec.nazev}</label>
	</div>

	{#if vec.zobrazitError}
		<p class="text-danger">{vec.onError}</p>
	{/if}
{/if}
