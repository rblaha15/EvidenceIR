<script lang="ts">
	import type { Zaskrtavatkova } from '$lib/Vec';

	export let vec: Zaskrtavatkova;
</script>

{#if vec.zobrazit}
	<div class="form-check">
		<label class="form-check-label">
			{vec.nazev}
			<input class="form-check-input" type="checkbox" bind:checked={vec.zaskrtnuto} />
		</label>
	</div>

	{#if vec.zobrazitError}
		<p class="text-danger">{vec.onError}</p>
	{/if}
{/if}
