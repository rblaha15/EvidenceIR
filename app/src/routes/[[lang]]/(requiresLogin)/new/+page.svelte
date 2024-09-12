<script lang="ts">
	import { DvojVybiratko, Pisatko, Prepinatko, Vybiratko } from '$lib/components/veci';
	import { MultiZaskrtavatko, Radio, Zaskrtavatko } from '$lib/components/veci';
	import VybiratkoFirmy from '$lib/components/VybiratkoFirmy.svelte';
	import Scanner from '$lib/components/Scanner.svelte';

	import * as v from '$lib/Vec';
	import { dataToRawData, newData, rawDataToData, type RawData, type Data } from '$lib/Data';
	import { friendlyCompanies, responsiblePerson } from '$lib/client/realtime';
	import { chosenCompanies, companies, filteredCompanies } from './companies';
	import odeslat from './odeslat';
	import { p } from '$lib/Vec';
	import { evidence } from '$lib/client/firestore';
	import { storable } from '$lib/helpers/stores';

	import { dev } from '$app/environment';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	const t = $page.data.translations;

	const storedData = storable<RawData | null>(null, `storedData`);

	let mode: 'loading' | 'create' | 'edit' | 'createStored' = 'loading';
	let data: Data = newData();
	onMount(async () => {
		const ir = $page.url.searchParams.get('edit');
		if (ir) {
			const snapshot = await evidence(ir);
			console.log(snapshot);
			if (snapshot.exists() && snapshot.data() != undefined) {
				data = rawDataToData(data, snapshot.data()!.evidence);
				return (mode = 'edit');
			}
		}
		const stored = $storedData;
		if (stored == null) {
			return (mode = 'create');
		} else {
			data = rawDataToData(data, stored);
			return (mode = 'createStored');
		}
	});

	friendlyCompanies.subscribe((c) => {
		if (data.montazka.ico.value == '' && c.assemblyCompanies.length == 1) {
			data.montazka.ico.updateText(c.assemblyCompanies[0].crn);
			data.montazka.email.value = c.assemblyCompanies[0].email ?? '';
		}
		if (data.uvedeni.ico.value == '' && c.commissioningCompanies.length == 1) {
			data.uvedeni.ico.updateText(c.commissioningCompanies[0].crn);
			data.uvedeni.email.value = c.commissioningCompanies[0].email ?? '';
		}
	});

	$: if (mode != 'loading') {
		data.ostatni.zodpovednaOsoba.zobrazit = () => $responsiblePerson == null;
		if ($responsiblePerson != null) data.ostatni.zodpovednaOsoba.value = $responsiblePerson;
	}
	$: if (mode != 'loading') {
		if (data.uvedeni.jakoMontazka.value) {
			data.uvedeni.ico.updateText('');
			data.uvedeni.email.value = '';
		} else if (
			data.uvedeni.ico.value == data.montazka.ico.value &&
			data.uvedeni.ico.value != '' &&
			data.uvedeni.email.value == data.montazka.email.value &&
			data.uvedeni.email.value != ''
		) {
			data.uvedeni.jakoMontazka.value = true;
			data.uvedeni.ico.updateText('');
			data.uvedeni.email.value = '';
		}
	}
	$: if (mode != 'loading') {
		if (data.mistoRealizace.jakoBydliste.value) {
			data.mistoRealizace.obec.updateText('');
			data.mistoRealizace.psc.value = '';
			data.mistoRealizace.ulice.value = '';
		} else if (
			data.mistoRealizace.obec.value == data.bydliste.obec.value &&
			data.mistoRealizace.obec.value != '' &&
			data.mistoRealizace.psc.value == data.bydliste.psc.value &&
			data.mistoRealizace.psc.value != '' &&
			data.mistoRealizace.ulice.value == data.bydliste.ulice.value &&
			data.mistoRealizace.ulice.value != ''
		) {
			data.mistoRealizace.jakoBydliste.value = true;
			data.mistoRealizace.obec.updateText('');
			data.mistoRealizace.psc.value = '';
			data.mistoRealizace.ulice.value = '';
		}
	}
	$: if (mode != 'loading') {
		if (!data.tc.model.moznosti(data).includes(data.tc.model.value ?? '')) {
			data.tc.model.value = null;
		}
	}
	$: if (mode != 'loading') {
		if (data.ir.typ.value.second == p`RTC`) {
			data.tc.typ.value = 'airToWater';
		}
	}
	$: if (mode != 'loading') {
		storedData.set(dataToRawData(data));
	}

	const filter = writable('');
	$: filtered = filteredCompanies(filter);
	$: chosen =
		mode != 'loading'
			? $chosenCompanies(data.montazka.ico.value, data.uvedeni.ico.value)
			: undefined;

	$: list =
		mode != 'loading'
			? (Object.values(data) as Data[keyof Data][]).flatMap(
					(obj) => Object.values(obj) as v.Vec<Data, any>[]
				)
			: [];

	let vysledek = {
		text: '',
		red: false,
		load: false
	};
	let doNotSend = false;
</script>

<div class="d-flex flex-row flex-wrap">
	<h1 class="flex-grow-1">{mode == 'edit' ? t.editation : t.controllerRegistration}</h1>
	{#if mode == 'create' || mode == 'createStored'}
		<!-- <div class="d-sm-none w-100" /> -->
		<div class="d-flex ms-auto me-2 justify-content-end align-items-center">
			<button
				class="btn"
				on:click={() => {
					$storedData = null;
					window.location.reload();
				}}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					fill="currentColor"
					viewBox="0 0 16 16"
				>
					<path
						fill-rule="evenodd"
						d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"
					/>
					<path
						d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"
					/>
				</svg>
				<span class="ms-2">{t.emptyForm}</span>
			</button>
		</div>
	{/if}
</div>

{#each list as vec}
	{#if vec === data.montazka.ico && vec.zobrazit(data)}
		<p>{t.chosenCompany}: {chosen?.assemblyCompanies ?? t.unknown_Company}</p>
		{#if $companies.assemblyCompanies.length > 1}
			<VybiratkoFirmy
				id="montazka"
				bind:emailVec={data.montazka.email}
				bind:zastupceVec={data.montazka.zastupce}
				bind:icoVec={data.montazka.ico}
				bind:filtr={$filter}
				vyfiltrovanyFirmy={$filtered.assemblyCompanies}
				{t}
			/>
		{/if}
	{/if}
	{#if vec === data.uvedeni.ico && vec.zobrazit(data)}
		<p>{t.chosenCompany}: {chosen?.commissioningCompanies ?? t.unknown_Company}</p>
		{#if $companies.commissioningCompanies.length > 1}
			<VybiratkoFirmy
				id="uvedeni"
				bind:emailVec={data.uvedeni.email}
				bind:zastupceVec={data.uvedeni.zastupce}
				bind:icoVec={data.uvedeni.ico}
				bind:filtr={$filter}
				vyfiltrovanyFirmy={$filtered.commissioningCompanies}
				{t}
			/>
		{/if}
	{/if}
	{#if vec === data.tc.cislo && vec.zobrazit(data)}
		<Scanner
			bind:vec={data.tc.cislo}
			zobrazit={data.ir.typ.value.second == p`CTC`}
			onScan={(text) => (data.tc.cislo.value = text.slice(8))}
			{t}
			{data}
		/>
	{:else if vec instanceof v.Nadpisova && vec.zobrazit(data)}
		<h2>{t.get(vec.nazev(data))}</h2>
	{:else if vec instanceof v.Textova && vec.zobrazit(data)}
		<p>{t.get(vec.nazev(data))}</p>
	{:else if vec instanceof v.Pisatkova && vec.zobrazit(data)}
		<p><Pisatko bind:vec {t} {data} disabled={vec == data.ir.cislo && mode == 'edit'} /></p>
	{:else if vec instanceof v.DvojVybiratkova && vec.zobrazit(data)}
		<p><DvojVybiratko bind:vec {t} {data} /></p>
	{:else if vec instanceof v.Vybiratkova && vec.zobrazit(data)}
		<p><Vybiratko bind:vec {t} {data} /></p>
	{:else if vec instanceof v.Radiova && vec.zobrazit(data)}
		<p><Radio bind:vec {t} {data} /></p>
	{:else if vec instanceof v.Prepinatkova && vec.zobrazit(data)}
		<p><Prepinatko bind:vec {t} {data} /></p>
	{:else if vec instanceof v.MultiZaskrtavatkova && vec.zobrazit(data)}
		<p><MultiZaskrtavatko {t} bind:vec {data} /></p>
	{:else if vec instanceof v.Zaskrtavatkova && vec.zobrazit(data)}
		<p><Zaskrtavatko {t} bind:vec {data} /></p>
	{/if}
{/each}

{#if dev}
	<div class="form-check">
		<p>
			<label class="form-check-label">
				<input class="form-check-input" type="checkbox" bind:checked={doNotSend} />
				Neodesílat emaily
			</label>
		</p>
	</div>
{/if}

<div class="d-inline-flex flex-sm-row flex-column align-content-center">
	<div class="d-inline-flex align-content-center text-break">
		{#if !vysledek.load}
			<button
				id="odeslat"
				type="button"
				class="btn btn-success"
				on:click={() =>
					odeslat(
						data,
						(v) => (vysledek = v),
						doNotSend,
						mode == 'edit',
						() => {
							for (const i in list) {
								list[i].zobrazitErrorVeto = true;
							}
						}
					)}
			>
				{t.save}
			</button>
		{/if}
		{#if mode == 'edit'}
			<button type="button" class="btn btn-outline-secondary ms-2" on:click={() => history.back()}>
				{t.back}
			</button>
		{/if}
	</div>

	<div class="d-inline-flex align-content-center text-break mt-2 mt-sm-0">
		{#if vysledek.load}
			<div class="spinner-border text-danger ms-2" />
		{/if}
		<p class:text-danger={vysledek.red} class="ms-2 my-auto">{@html vysledek.text}</p>
	</div>
</div>
