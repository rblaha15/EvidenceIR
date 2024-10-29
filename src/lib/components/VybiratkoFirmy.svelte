<script lang="ts" generics="D">
	import type { Company } from '$lib/client/realtime';
	import type { Translations } from '$lib/translations';
	import type { Pisatkova } from '$lib/Vec.svelte';
	import { onMount } from 'svelte';

	interface Props {
		t: Translations;
		id: 'Montazka' | 'Uvedeni';
		emailVec: Pisatkova<D>;
		phoneVec: Pisatkova<D>;
		zastupceVec: Pisatkova<D>;
		icoVec: Pisatkova<D>;
		filtr: string;
		vyfiltrovanyFirmy: Company[];
		neVyfiltrovanyFirmy: Company[];
	}

	let {
		t,
		id,
		emailVec = $bindable(),
		phoneVec = $bindable(),
		zastupceVec = $bindable(),
		icoVec = $bindable(),
		filtr = $bindable(),
		vyfiltrovanyFirmy,
		neVyfiltrovanyFirmy
	}: Props = $props();

	onMount(async () => {
		const { Modal } = await import('bootstrap');

		window.onbeforeunload = () => {
			const modal = new Modal(`#vyberFirem${id}`);
			modal.hide();
		};
	});
</script>

{#if neVyfiltrovanyFirmy.length == 1}
	<button
		type="button"
		onclick={() => {
			emailVec.value = vyfiltrovanyFirmy[0].email ?? '';
			phoneVec.value = vyfiltrovanyFirmy[0].phone ?? '';
			if (id == 'Montazka') zastupceVec.value = vyfiltrovanyFirmy[0].representative ?? '';
			icoVec.updateText(vyfiltrovanyFirmy[0].crn);
		}}
		class="btn btn-outline-secondary"
	>
		{vyfiltrovanyFirmy[0].companyName} - {vyfiltrovanyFirmy[0].crn}
	</button>
{:else}
	<button
		type="button"
		class="btn btn-outline-secondary"
		data-bs-toggle="modal"
		data-bs-target="#vyberFirem{id}">{t.chooseFromList}</button
	>
{/if}

<p class="my-2">-- {t.or} --</p>

<div class="modal" id="vyberFirem{id}">
	<div class="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-fullscreen-sm-down">
		<div class="modal-content">
			<div class="modal-header">
				<h4 class="modal-title">{t.chooseCompanyFromList}</h4>
				<button type="button" class="btn-close" data-bs-dismiss="modal" title={t.cancel} aria-label={t.cancel}></button>
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
							onclick={() => {
								emailVec.value = company.email ?? '';
								phoneVec.value = company.phone ?? '';
								if (id == 'Montazka') zastupceVec.value = company.representative ?? '';
								icoVec.updateText(company.crn);
								filtr = '';
							}}>{company.companyName} - {company.crn}</button
						>
					{/each}
				</div>
			</div>

			<div class="modal-footer d-sm-none">
				<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{t.cancel}</button>
			</div>
		</div>
	</div>
</div>
