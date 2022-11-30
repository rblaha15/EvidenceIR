<script lang="ts">
	import type { Vec } from '$lib/Vec';

	export let id: string;
	export let emailVec: Vec;
	export let zastupceVec: Vec;
	export let icoVec: Vec;
	export let filtr: string;
	export let vyfiltrovanyFirmy: string[][];
</script>

<button
	type="button"
	class="btn btn-outline-secondary mt-1"
	data-bs-toggle="modal"
	data-bs-target="#vyberFirem{id}">Vyberte ze seznamu</button
>
<p class="my-2">-- nebo --</p>

<div class="modal" id="vyberFirem{id}">
	<div class="modal-dialog modal-dialog-scrollable modal-dialog-centered">
		<div class="modal-content">
			<div class="modal-header ">
				<h4 class="modal-title">Vyberte firmu ze seznamu:</h4>
				<button type="button" class="btn-close" data-bs-dismiss="modal" />
			</div>
			<div class="d-flex m-2 align-center align-content-center align-items-center">
				<label for="filtr" class="m-1">Hledat: </label>
				<input id="filtr" type="text" class="form-control" bind:value={filtr} />
			</div>

			<div class="modal-body list-group list-group-flush">
				{#each vyfiltrovanyFirmy as [jmeno, ico, email, zastupce]}
					<button
						data-bs-dismiss="modal"
						class="list-group-item list-group-item-action"
						on:click={() => {
							emailVec.text = email;
							zastupceVec.text = zastupce;
							icoVec.text = ico;
							filtr = '';
						}}>{jmeno} - {ico}</button
					>
				{/each}
			</div>

			<div class="modal-footer">
				<button type="button" class="btn btn-outline-danger" data-bs-dismiss="modal">Zrušit</button>
			</div>
		</div>
	</div>
</div>
