<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import PdfLink from '$lib/components/PDFLink.svelte';
	import { checkAuth } from '$lib/client/auth';
	import { evidence, novaEvidence, odstranitEvidenci, type IR } from '$lib/client/firestore';
	import IMask from 'imask';
	import { relUrl, storable } from '$lib/helpers/stores';
	import { nazevIR } from '$lib/Data';
	import type { RawUvedeni } from '$lib/Uvedeni';

	export let data: PageData;
	const t = data.translations;

	const storedCommission = storable<RawUvedeni | null>(null, `storedCommission-${data.ir}`);

	let existuje: boolean;
	let values: IR;
	let nacita = true;
	onMount(async () => {
		nacita = false;

		await checkAuth();
		try {
			let snapshot = await evidence(data.ir);
			if (!snapshot.exists()) {
				existuje = false;
				return;
			}
			values = snapshot.data();
			existuje = true;
		} catch (e) {
			console.log(e);
			existuje = false;
			return;
		}

		if ($storedCommission != null && values.uvedeni != undefined) {
			storedCommission.set(null)
		}
	});

	const remove = async () => {
		await odstranitEvidenci(data.ir);
		window.location.reload();
	};

	let change: 'no' | 'input' | 'sending' | 'fail' = 'no';

	let input: HTMLInputElement | undefined;
	$: mask =
		input == undefined
			? undefined
			: IMask(input, {
					mask: 'A1 0000',
					definitions: {
						A: /[A-Z]/,
						'1': /[1-9OND]/
					}
				});

	onMount(() => {
		return () => {
			input = undefined;
		};
	});

	const changeController = async () => {
		if (!mask || !mask.value) return (change = 'fail');
		const newIr = mask.value;
		change = 'sending';
		const record = (await evidence(data.ir)).data()!;
		record.evidence.ir.cislo = newIr;
		await novaEvidence(record);
		await odstranitEvidenci(data.ir);
		window.location.replace($relUrl(`/detail/${newIr.replace(' ', '')}`));
	};
</script>

<h1>
	{values
		? t.evidenceDetailsHtml.parseTemplate({
				irType: nazevIR(t, values.evidence.ir.typ),
				irNumber: values ? values.evidence.ir.cislo : ''
			})
		: t.evidenceDetails}
</h1>
{#if existuje == undefined}
	<div class="spinner-border text-danger" />
{:else if !existuje}
	<p class="mt-2">{t.sorrySomethingWentWrong}</p>
	<p class="mt-2">{t.linkInvalid}</p>
{:else}
	{#if values.evidence.vzdalenyPristup.chce}
		<PdfLink name={t.regulusRouteForm} {t} linkName="rroute" {data} />
	{/if}
	<PdfLink name={t.routeGuide} {t} linkName="guide" {data} />
	{#if values.evidence.ir.chceVyplnitK.includes('heatPump')}
		<PdfLink name={t.warranty} {t} linkName="warranty" {data} />
		<PdfLink
			enabled={values.uvedeni != undefined}
			name={t.commissionProtocol}
			{t}
			linkName="commissionProtocol"
			{data}
		>
			{#if !values.uvedeni}
				<button
					class="btn btn-outline-info d-block mt-2 mt-sm-0 ms-sm-2"
					on:click={() => (window.location.href = $relUrl(`/detail/${data.ir}/commission`))}
					>{t.commission}</button
				>
			{/if}
		</PdfLink>
		<!-- <PdfLink name={t.installationApproval} {t} linkName="installationApproval" {data} /> -->
		<PdfLink name={t.filledYearlyCheck} {t} linkName="check" {data}>
			<button
				class="btn btn-outline-info d-block mt-2 mt-sm-0 ms-sm-2"
				on:click={() => (window.location.href = $relUrl(`/detail/${data.ir}/check`))}
				>{t.doYearlyCheck}</button
			>
		</PdfLink>
	{/if}
	<!-- <p class="mt-2">{t.wrongTime}</p> -->
	{#if change == 'no'}
		<button class="btn btn-outline-warning d-block mt-2" on:click={() => (change = 'input')}
			>{t.changeController}</button
		>
	{:else if change == 'input'}
		<div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center mt-2">
			<input
				type="search"
				class="form-control me-2"
				placeholder={t.newSerialNumber}
				bind:this={input}
			/>
			<div class="btn-group ms-sm-2 mt-2 mt-sm-0">
				<button class="btn btn-danger" on:click={changeController}>{t.confirm}</button>
				<button class="btn btn-outline-secondary" on:click={() => (change = 'no')}
					>{t.cancel}</button
				>
			</div>
		</div>
	{:else if change == 'sending'}
		<div class="d-flex align-items-center mt-2">
			<span>{t.saving}...</span>
			<div class="spinner-border text-danger ms-2" />
		</div>
	{:else if change == 'fail'}
		<p class="mt-2 text-danger">{t.changeWentWrong}</p>
	{/if}
	<button
		class="btn btn-outline-warning d-block mt-2"
		on:click={() => (window.location.href = $relUrl(`/new?edit=${data.ir}`))}
		>{t.editRegistration}</button
	>
	<button class="btn btn-outline-danger d-block mt-2" on:click={remove}
		>{t.deleteThisEvidence}</button
	>
{/if}
