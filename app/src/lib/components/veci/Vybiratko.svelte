<script context="module" lang="ts">
	let lastId = -1;
</script>

<script lang="ts">
	import type { Data } from '$lib/Data';

	import type { Translations } from '$lib/translations';
	import { nazevSHvezdou, type Vybiratkova } from '$lib/Vec';

	export let t: Translations;
	export let vec: Vybiratkova;
	export let data: Data;
</script>

{#if vec.zobrazit({ t, data })}
	<label>
		{nazevSHvezdou(vec, { t, data })}
		<div class="dropdown">
			<button
				type="button"
				class="btn btn-outline-secondary dropdown-toggle"
				data-bs-toggle="dropdown"
			>
				{vec.vybrano != null ? vec.value({ t, data }) : t.notChosen}
			</button>
			<ul class="dropdown-menu">
				{#each vec.moznosti({ t, data }) as moznost, i}
					<li>
						<button class="dropdown-item" on:click={() => (vec.vybrano = i)}>
							{moznost}
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</label>

	{#if vec.zobrazitError({ t, data })}
		<p class="text-danger">{vec.onError({ t, data })}</p>
	{/if}
{/if}
