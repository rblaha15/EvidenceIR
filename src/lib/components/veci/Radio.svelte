<script lang="ts" generics="D">
	import type { Translations } from '$lib/translations';
	import { nazevSHvezdou, type Radiova } from '$lib/Vec.svelte';

	interface Props {
		t: Translations;
		vec: Radiova<D>;
		data: D;
	}

	let { t, vec = $bindable(), data }: Props = $props();
</script>

{#if vec.zobrazit(data)}
	<label class="d-block" for="">{nazevSHvezdou(vec, data, t)}</label>
	{#each vec.moznosti(data) as moznost}
		<div class="form-check">
			<label class="form-check-label">
				{t.get(moznost)}
				<input type="radio" class="form-check-input" bind:group={vec.value} value={moznost} />
			</label>
		</div>
	{/each}

	<div class="mb-2"></div>

	{#if vec.zobrazitError(data)}
		<p class="text-danger">{t.get(vec.onError(data))}</p>
	{/if}
{/if}
