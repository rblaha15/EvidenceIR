<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import PdfLink from '$lib/components/PDFLink.svelte';
	import { checkAuth, currentUser, isUserAdmin } from '$lib/client/auth';
	import { evidence, novaEvidence, odstranitEvidenci, type IR } from '$lib/client/firestore';
	import IMask from 'imask';
	import { relUrl, storable } from '$lib/helpers/stores';
	import { nazevIR } from '$lib/Data';
	import type { RawUvedeni } from '$lib/Uvedeni';
	import type { FirebaseError } from 'firebase/app';
	import { getIsOnline } from '$lib/client/realtime';

	export let data: PageData;
	const t = data.translations;

	const storedCommission = storable<RawUvedeni | null>(null, `storedCommission-${data.ir}`);

	let state: 'loading' | 'loaded' | 'noAccess' | 'offline' = 'loading';
	let values: IR;
	onMount(async () => {
		state = 'loading';

		await checkAuth();
		try {
			let snapshot = await evidence(data.ir as string);
			if (!snapshot.exists()) {
				state = 'noAccess';
				return;
			}
			values = snapshot.data();
			state = 'loaded';
		} catch (e) {
			console.log((e as FirebaseError).code);
			if ((e as FirebaseError).code == 'unavailable' && !getIsOnline()) state = 'offline';
			else state = 'noAccess';
			return;
		}

		if ($storedCommission != null && values.uvedeni != undefined) {
			storedCommission.set(null);
		}
	});

	const remove = async () => {
		await odstranitEvidenci(data.ir as string);
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
{#if state == 'loading'}
	<div class="spinner-border text-danger" />
{:else if state != 'loaded'}
	<h3>
		{data.ir.slice(0, 2)}
		{data.ir.slice(2, 6)}
	</h3>
	<p class="mt-3">{t.sorrySomethingWentWrong}</p>
	<p>
		{#if state == 'noAccess'}
			{t.linkInvalid}
		{:else if state == 'offline'}
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
	{#if $currentUser?.email?.endsWith('@regulus.cz') || $isUserAdmin}
		<a class="btn btn-outline-info mt-2" href={$relUrl(`/detail/${data.ir}/users`)}
			>Uživatelé s přístupem k této evidenci</a
		>
	{/if}
	{#if change == 'no'}
		<button class="btn btn-outline-warning d-block mt-2" on:click={() => (change = 'input')}
			>{t.changeController}</button
		>
	{:else if change == 'input'}
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
	<a
		class="btn btn-outline-warning mt-2"
		href={$relUrl(`/new?edit=${data.ir}`)}
		on:click|preventDefault={() => (window.location.href = $relUrl(`/new?edit=${data.ir}`))}
		>{t.editRegistration}</a
	>
	<button class="btn btn-outline-danger d-block mt-2" on:click={remove}
		>{t.deleteThisEvidence}</button
	>
{/if}
