<script type="ts">
	import type { Vec } from './Vec';

	export let vec: Vec;
</script>

<label for={vec.nazev}>{vec.nazev}</label>
<input id={vec.nazev} type="text" class="form-control" bind:value={vec.text} />

{#if vec.zobrazitError}
	<p class="text-danger">{vec.onError}</p>
{/if}
