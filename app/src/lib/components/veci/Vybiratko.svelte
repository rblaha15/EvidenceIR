<script lang="ts">
	type D = $$Generic;
	import type { Translations } from '$lib/translations';
	import { nazevSHvezdou, type Vybiratkova } from '$lib/Vec';

	export let t: Translations;
	export let vec: Vybiratkova<D>;
	export let data: D;
</script>

{#if vec.zobrazit(data)}
	<label>
		{nazevSHvezdou(vec, data, t)}
		<div class="dropdown">
			<button
				type="button"
				class="btn btn-outline-secondary dropdown-toggle"
				data-bs-toggle="dropdown"
			>
				{t.getN(vec.value) ?? t.notChosen}
			</button>
			<ul class="dropdown-menu">
				{#each vec.moznosti(data) as moznost}
					<li>
						<button class="dropdown-item" on:click={() => (vec.value = moznost)}>
							{t.get(moznost)}
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</label>

	{#if vec.zobrazitError(data)}
		<p class="text-danger">{t.get(vec.onError(data))}</p>
	{/if}
{/if}
