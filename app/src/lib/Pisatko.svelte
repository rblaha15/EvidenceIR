<script type="ts">
	import type { Vec } from './Vec';

	export let vec: Vec;
</script>

{#if vec.zobrazit}
	<label for={vec.nazev}>{vec.nazev}</label>
	<input
		id={vec.nazev}
		type="text"
		class="form-control"
		bind:value={vec.text}
		placeholder={vec.vybrano}
	/>

	{#if vec.zobrazitError}
		<span class="text-danger help-block">{vec.onError}</span>
	{/if}
{/if}
