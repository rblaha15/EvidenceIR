<script lang="js">
	export let nazev = "";
	export let vybrano = "";
	export let moznosti = [""];
</script>

<label for={nazev}>{nazev}</label>
<!--select id={nazev} bind:value={vybrano}>
	{#each moznosti as moznost}
		<option>{moznost}</option>
	{/each}
</select-->

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
