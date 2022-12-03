<script context="module" lang="ts">
	let lastId = -1;
</script>

<script lang="ts">
	import type { Vybiratkova } from '$lib/Vec';

	export let vec: Vybiratkova;
	const id = lastId++;
</script>

{#if vec.zobrazit}
	<label>
		{vec.nazev}
		<div class="dropdown">
			<button
				type="button"
				class="btn btn-outline-secondary dropdown-toggle"
				data-bs-toggle="dropdown"
			>
				{vec.vybrano != '' ? vec.vybrano : 'Nevybráno'}
			</button>
			<ul class="dropdown-menu">
				{#each vec.moznosti as moznost}
					<li>
						<button class="dropdown-item" on:click={() => (vec.vybrano = moznost)}>
							{moznost}
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</label>

	{#if vec.zobrazitError}
		<p class="text-danger">{vec.onError}</p>
	{/if}
{/if}
