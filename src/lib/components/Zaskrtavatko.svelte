<script lang="ts">
	import type { Data } from '$lib/Data';
	import type { Translations } from '$lib/translations';
	import type { Zaskrtavatkova } from '$lib/Vec';

	export let t: Translations
	export let vec: Zaskrtavatkova;
	export let data: Data;
</script>

{#if vec.zobrazit(t, data)}
	<div class="form-check">
		<label class="form-check-label">
			{vec.nazev(t, data)}
			<input class="form-check-input" type="checkbox" bind:checked={vec.zaskrtnuto} />
		</label>
	</div>

	{#if vec.zobrazitError(t, data)}
		<p class="text-danger">{vec.onError(t, data)}</p>
	{/if}
{/if}
