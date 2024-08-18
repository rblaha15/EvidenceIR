<script context="module" lang="ts">
	let lastId = -1;
</script>

<script lang="ts">
	import type { Data } from '$lib/Data';

	import type { Translations } from '$lib/translations';
	import type { DvojVybiratkova } from '$lib/Vec';

	export let t: Translations;
	export let vec: DvojVybiratkova;
	export let data: Data;
</script>

{#if vec.zobrazit(t, data)}
	<label for={vec.nazev(t, data)}>{vec.nazev(t, data)}</label>
	<div class="d-sm-flex flex-sm-row align-items-start justify-end mb-2">
		<div class="dropdown">
			<button
				type="button"
				id={vec.nazev(t, data)}
				class="btn btn-outline-secondary dropdown-toggle"
				data-bs-toggle="dropdown"
			>
				{vec.vybrano1 != null ? vec.value(t, data)[0] : t.notChosen}
			</button>
			<ul class="dropdown-menu">
				{#each vec.moznosti1(t, data) as moznost, i}
					<li>
						<button class="dropdown-item" on:click={() => (vec.vybrano1 = i)}>
							{moznost}
						</button>
					</li>
				{/each}
			</ul>
		</div>
		{#if vec.vybrano1 != null}
			<div class="dropdown ms-sm-2 mt-sm-0 mt-2">
				<button
					type="button"
					class="btn btn-outline-secondary dropdown-toggle"
					data-bs-toggle="dropdown"
				>
					{vec.vybrano2 != null ? vec.value(t, data)[1] : t.notChosen}
				</button>
				<ul class="dropdown-menu">
					{#each vec.moznosti2(t, data) as moznost, i}
						<li>
							<button class="dropdown-item" on:click={() => (vec.vybrano2 = i)}>
								{moznost}
							</button>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
	{#if vec.zobrazitError(t, data)}
		<p class="text-danger">{vec.onError(t, data)}</p>
	{/if}
{/if}
