<script lang="ts">
	import type { Vec } from './Vec';

	export let vec: Vec;
</script>

{#if vec.zobrazit}
	<label for={vec.nazev}>{vec.nazev}</label>

	<div class="dropdown" id={vec.nazev}>
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
					<a class="dropdown-item" href="/" on:click={() => (vec.vybrano = moznost)}>
						{moznost}
					</a>
				</li>
			{/each}
		</ul>
	</div>

	{#if vec.zobrazitError}
		<p class="text-danger">{vec.onError}</p>
	{/if}
{/if}
