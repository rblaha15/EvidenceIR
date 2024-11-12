<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import PdfLink from './PDFLink.svelte';
	import { checkAuth, currentUser, isUserAdmin } from '$lib/client/auth';
	import { evidence, novaEvidence, odstranitEvidenci, type IR } from '$lib/client/firestore';
	import IMask from 'imask';
	import { relUrl, storable } from '$lib/helpers/stores';
	import { nazevIR } from '$lib/Data';
	import type { RawUvedeniTC } from '$lib/UvedeniTC';
	import type { FirebaseError } from 'firebase/app';
	import { getIsOnline } from '$lib/client/realtime';
	import { addToHistory, removeFromHistory } from '$lib/History';
	import { HistoryEntry } from '$lib/History.js';
	import { page } from '$app/stores';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	const t = data.translations;

	const deleted = $page.url.searchParams.has('deleted');
	const storedHeatPumpCommission = storable<RawUvedeniTC>(`stored_heat_pump_commission_${data.ir}`);

	let type: 'loading' | 'loaded' | 'noAccess' | 'offline' = $state('loading');
	let values = $state() as IR;
	const historyEntry = $derived(HistoryEntry(t, values.evidence));
	onMount(async () => {

		type = 'loading';
		await checkAuth();

		try {
			let snapshot = await evidence(data.ir as string);
			if (!snapshot.exists()) {
				type = 'noAccess';
				return;
			}
			values = snapshot.data();
			type = 'loaded';
		} catch (e) {
			console.log((e as FirebaseError).code);
			if ((e as FirebaseError).code == 'unavailable' && !getIsOnline()) type = 'offline';
			else type = 'noAccess';
			return;
		}
		if ($storedHeatPumpCommission != undefined && values.uvedeniTC != undefined) {
			storedHeatPumpCommission.set(undefined);
		}
		addToHistory(historyEntry)
	});

	const remove = async () => {
		removeFromHistory(historyEntry)
		await odstranitEvidenci(data.ir as string);
		window.location.replace($relUrl(`/detail/${data.ir}?deleted`));
	};

	let change: 'no' | 'input' | 'sending' | 'fail' = $state('no');

	let input: HTMLInputElement | undefined = $state();
	let mask = $derived(
		input == undefined
			? undefined
			: IMask(input, {
					mask: 'A1 0000',
					definitions: {
						A: /[A-Z]/,
						'1': /[1-9OND]/
					}
				})
	);

	onMount(() => {
		return () => {
			input = undefined;
		};
	});

	const changeController = async () => {
		if (!mask || !mask.value) return (change = 'fail');
		const newIr = mask.value;
		change = 'sending';
		const record = (await evidence(data.ir as string)).data()!;
		record.evidence.ir.cislo = newIr;
		await novaEvidence(record);
		await odstranitEvidenci(data.ir as string);
		window.location.replace($relUrl(`/detail/${newIr.replace(' ', '')}`));
	};
</script>

<h1>
	{t.evidenceDetails}
</h1>
{#if deleted}
	<div class="alert alert-success" role="alert">
		{t.successfullyDeleted}
	</div>
{/if}
{#if type === 'loading'}
	<div class="spinner-border text-danger"></div>
{:else if type !== 'loaded'}
	<h3>
		{data.ir.slice(0, 2)}
		{data.ir.slice(2, 6)}
	</h3>
	<p class="mt-3">{t.sorrySomethingWentWrong}</p>
	<p>
		{#if type === 'noAccess'}
			{t.linkInvalid}
		{:else if type === 'offline'}
			{t.offline}
		{/if}
	</p>
{:else}
	<h3>
		{nazevIR(t, values.evidence.ir.typ)}
		{values.evidence.ir.cislo} : {values.evidence.koncovyUzivatel.prijmeni}
		{values.evidence.koncovyUzivatel.jmeno} - {values.evidence.mistoRealizace.obec}
	</h3>
	{#if values.evidence.vzdalenyPristup.chce}
		<PdfLink name={t.regulusRouteForm} {t} linkName="rroute" {data} />
	{/if}
	<PdfLink name={t.routeGuide} {t} linkName="guide" {data} />
	{#if values.evidence.ir.chceVyplnitK.includes('heatPump')}
		<PdfLink name={t.warranty} {t} linkName="warranty" {data} />
		<PdfLink
			enabled={values.uvedeniTC !== undefined}
			name={t.heatPumpCommissionProtocol}
			{t}
			linkName="heatPumpCommissionProtocol"
			{data}
		>
			{#if !values.uvedeniTC}
				<button
					class="btn btn-outline-info d-block mt-2 mt-sm-0 ms-sm-2"
					onclick={() => (window.location.href = $relUrl(`/detail/${data.ir}/heatPumpCommission`))}
					>{t.commission}</button
				>
			{/if}
		</PdfLink>
		<!-- <PdfLink name={t.installationApproval} {t} linkName="installationApproval" {data} /> -->
		<PdfLink name={t.filledYearlyCheck} {t} linkName="check" {data}>
			<button
				class="btn btn-outline-info d-block mt-2 mt-sm-0 ms-sm-2"
				onclick={() => (window.location.href = $relUrl(`/detail/${data.ir}/check`))}
				>{t.doYearlyCheck}</button
			>
		</PdfLink>
	{/if}
	{#if values.evidence.ir.chceVyplnitK.includes('solarCollector')}
		<PdfLink
			enabled={values.uvedeniSOL !== undefined}
			name={t.solarCollectorCommissionProtocol}
			{t}
			linkName="solarCollectorCommissionProtocol"
			{data}
		>
			{#if !values.uvedeniSOL}
				<button
					class="btn btn-outline-info d-block mt-2 mt-sm-0 ms-sm-2"
					onclick={() => (window.location.href = $relUrl(`/detail/${data.ir}/solarCollectorCommission`))}
					>{t.commission}</button
				>
			{/if}
		</PdfLink>
	{/if}
	{#if $currentUser?.email?.endsWith('@regulus.cz') || $isUserAdmin}
		<a class="btn btn-outline-info mt-2" href={$relUrl(`/detail/${data.ir}/users`)}
			>Uživatelé s přístupem k této evidenci</a
		>
	{/if}
	{#if change === 'no'}
		<button class="btn btn-outline-warning d-block mt-2" onclick={() => (change = 'input')}
			>{t.changeController}</button
		>
	{:else if change === 'input'}
		<div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center mt-2">
			<label class="form-floating d-block me-2">
				<input
					type="search"
					placeholder={t.newSerialNumber}
					class="form-control"
					bind:this={input}
				/>
				<label for="">{t.newSerialNumber}</label>
			</label>
			<div class="btn-group ms-sm-2 mt-2 mt-sm-0">
				<button class="btn btn-danger" onclick={changeController}>{t.confirm}</button>
				<button class="btn btn-outline-secondary" onclick={() => (change = 'no')}>{t.cancel}</button
				>
			</div>
		</div>
	{:else if change === 'sending'}
		<div class="d-flex align-items-center mt-2">
			<span>{t.saving}...</span>
			<div class="spinner-border text-danger ms-2"></div>
		</div>
	{:else if change === 'fail'}
		<p class="mt-2 text-danger">{t.changeWentWrong}</p>
	{/if}
	<a
		class="btn btn-outline-warning mt-2"
		href={$relUrl(`/new?edit=${data.ir}`)}
		onclick={(e) => {
			e.preventDefault();
			window.location.href = $relUrl(`/new?edit=${data.ir}`);
		}}>{t.editRegistration}</a
	>
	<button class="btn btn-outline-danger d-block mt-2" onclick={remove}
		>{t.deleteThisEvidence}</button
	>
{/if}
