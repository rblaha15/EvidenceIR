<script lang="ts">
	type D = $$Generic;
	import type { Translations } from '$lib/translations';
	import { nazevSHvezdou, type Zaskrtavatkova } from '$lib/Vec.svelte';

	interface Props {
		t: Translations;
		vec: Zaskrtavatkova<D>;
		data: D;
	}

	let { t, vec = $bindable(), data }: Props = $props();
</script>

{#if vec.zobrazit(data)}
	<div class="form-check mb-3">
		<label class="form-check-label">
			<input class="form-check-input" type="checkbox" bind:checked={vec.value} />
			{nazevSHvezdou(vec, data, t)}
		</label>
	</div>

	{#if vec.zobrazitError(data)}
		<p class="text-danger">{t.get(vec.onError(data))}</p>
	{/if}
{/if}
