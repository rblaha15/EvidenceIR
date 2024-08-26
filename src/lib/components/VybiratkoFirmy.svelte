<script lang="ts">
	import type { Company } from '$lib/client/realtime';
	import type { Translations } from '$lib/translations';
	import type { Pisatkova } from '$lib/Vec';

	export let t: Translations;
	export let id: string;
	export let emailVec: Pisatkova;
	export let zastupceVec: Pisatkova;
	export let icoVec: Pisatkova;
	export let filtr: string;
	export let vyfiltrovanyFirmy: Company[];
</script>

<button
	type="button"
	class="btn btn-outline-secondary"
	data-bs-toggle="modal"
	data-bs-target="#vyberFirem{id}">{t.chooseFromList}</button
>
<p class="my-2">-- {t.or} --</p>

<div class="modal" id="vyberFirem{id}">
	<div class="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-fullscreen-sm-down">
		<div class="modal-content">
			<div class="modal-header">
				<h4 class="modal-title">{t.chooseCompanyFromList}</h4>
				<button type="button" class="btn-close" data-bs-dismiss="modal" title={t.cancel} />
			</div>
			<div class="modal-body">
				<div class="m-2">
					<input type="search" placeholder={t.search} class="form-control" bind:value={filtr} />
				</div>
				<div class="list-group list-group-flush">
					{#each vyfiltrovanyFirmy as company}
						<button
							data-bs-dismiss="modal"
							class="list-group-item list-group-item-action"
							on:click={() => {
								emailVec.value = company.email ?? '';
								zastupceVec.value = company.representative ?? '';
								icoVec.updateText(company.crn);
								filtr = '';
							}}>{company.companyName} - {company.crn}</button
						>
					{/each}
				</div>
			</div>

			<div class="modal-footer d-sm-none">
				<button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
					>{t.cancel}</button
				>
			</div>
		</div>
	</div>
</div>
