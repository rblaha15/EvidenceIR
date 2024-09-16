<script lang="ts">
	type D = $$Generic;
	import type { Translations } from '$lib/translations';
	import { nazevSHvezdou, type Zaskrtavatkova } from '$lib/Vec';

	export let t: Translations
	export let vec: Zaskrtavatkova<D>;
	export let data: D;
</script>

{#if vec.zobrazit(data)}
	<div class="form-check">
		<label class="form-check-label">
			<input class="form-check-input" type="checkbox" bind:checked={vec.value} />
			{nazevSHvezdou(vec, data, t)}
		</label>
	</div>

	{#if vec.zobrazitError(data)}
		<p class="text-danger">{t.get(vec.onError(data))}</p>
	{/if}
{/if}
