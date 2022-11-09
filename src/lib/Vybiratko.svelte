<script lang="ts">
	export let vybrano: string;
	export let nazev: string;
	export let moznosti: string[];
</script>

<label for={nazev}>{nazev}</label>

<div class="dropdown" id={nazev}>
	<button type="button" class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown">
		{vybrano != '' ? vybrano : 'Nevybráno'}
	</button>
	<ul class="dropdown-menu">
		{#each moznosti as moznost}
			<li>
				<a
					class="dropdown-item"
					href="/"
					on:click={() => {
						vybrano = moznost;
					}}>{moznost}</a
				>
			</li>
		{/each}
	</ul>
</div>
