<script lang="ts">
	import type { Data } from '$lib/Data';

	import type { Translations } from '$lib/translations';
	import { nazevSHvezdou, type DvojVybiratkova } from '$lib/Vec';

	export let t: Translations;
	export let vec: DvojVybiratkova;
	export let data: Data;
</script>

{#if vec.zobrazit(data)}
	<label for={nazevSHvezdou(vec, data, t)}>{nazevSHvezdou(vec, data, t)}</label>
	<div class="d-sm-flex flex-sm-row align-items-start justify-end mb-2">
		<div class="dropdown">
			<button
				type="button"
				id={nazevSHvezdou(vec, data, t)}
				class="btn btn-outline-secondary dropdown-toggle"
				data-bs-toggle="dropdown"
			>
				{t.getN(vec.value.first) ?? t.notChosen}
			</button>
			<ul class="dropdown-menu">
				{#each vec.moznosti1(data) as moznost}
					<li>
						<button class="dropdown-item" on:click={() => (vec.value.first = moznost)}>
							{t.get(moznost)}
						</button>
					</li>
				{/each}
			</ul>
		</div>
		{#if vec.value.first != null}
			<div class="dropdown ms-sm-2 mt-sm-0 mt-2">
				<button
					type="button"
					class="btn btn-outline-secondary dropdown-toggle"
					data-bs-toggle="dropdown"
				>
					{t.getN(vec.value.second) ?? t.notChosen}
				</button>
				<ul class="dropdown-menu">
					{#each vec.moznosti2(data) as moznost}
						<li>
							<button class="dropdown-item" on:click={() => (vec.value.second = moznost)}>
								{t.get(moznost)}
							</button>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
	{#if vec.zobrazitError(data)}
		<p class="text-danger">{t.get(vec.onError(data))}</p>
	{/if}
{/if}
