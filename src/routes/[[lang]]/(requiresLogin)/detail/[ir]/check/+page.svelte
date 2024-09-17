<script lang="ts">
	import { evidence, posledniKontrola, pridatKontrolu } from '$lib/client/firestore';
	import {
		kontrola,
		kontrolaTypes,
		checkNames,
		orderArray,
		type Kontrola,
		type KontrolaAsRecord,
		type NamesRecord
	} from '$lib/Kontrola';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { today } from '$lib/helpers/date';

	export let data: PageData;
	const ir = data.ir;
	const t = data.translations;

	let uvadec: string = '';
	let poznamka: string = '';
	const k = kontrola(data.languageCode, '', today()) as KontrolaAsRecord;
	const n = checkNames[data.languageCode] as NamesRecord;

	let rok: number | undefined;
	let prvniKontrola: KontrolaAsRecord | undefined;
	let nacita = true;
	onMount(async () => {
		nacita = false;
		rok = (await posledniKontrola(ir as string)) + 1;
		const snapshot = await evidence(ir as string);
		const kontroly = snapshot.data()?.kontroly as Record<number, Kontrola | undefined> | undefined;
		prvniKontrola = kontroly?.[1];
		const predchoziKontrola = kontroly?.[rok - 1];
		poznamka = predchoziKontrola?.meta.poznamky ?? '';
	});

	let vysledek = {
		text: '',
		red: false,
		load: false
	};

	const save = async () => {
		vysledek = { load: true, red: false, text: t.saving };
		k.meta.osoba = uvadec;
		k.meta.poznamky = poznamka;
		await pridatKontrolu(ir, rok!, k as Kontrola);

		vysledek = {
			text: 'Přesměrování...',
			red: false,
			load: true
		};
		window.history.back();
	};
</script>

<h1>{t.yearlyCheck}</h1>
<h3>{t.year}: {rok ?? '…'}</h3>

<label class="form-floating d-block mb-2">
	<input
		type="text"
		placeholder={t.get('performingPerson')}
		class="form-control"
		bind:value={uvadec}
	/>
	<label for="">{t.get('performingPerson')}</label>
</label>

{#each orderArray as v}
	{@const value = k[v.key1][v.key2]}
	{@const type = kontrolaTypes[v.key1][v.key2]}
	{@const name = type == 'nadpis' ? n[`${v.key1}Name`] : n[v.key1][v.key2]}
	{#if type == 'nadpis' && name}
		<h2>{name}</h2>
	{:else if type == 'boolean'}
		<p>
			<label>
				<input
					class="form-check-input"
					type="checkbox"
					{value}
					on:change={() => {
						k[v.key1][v.key2] = !value;
					}}
				/>
				{name}
			</label>
		</p>
	{:else if type == 'string' || (type == 'tlak' && rok == 1)}
		<label class="form-floating d-block mb-2">
			<input
				type="text"
				placeholder={name}
				class="form-control"
				value={value ?? ''}
				on:input={(e) => {
					k[v.key1][v.key2] = e.currentTarget.value;
				}}
			/>
			<label for="">{name}</label>
		</label>
	{:else if type == 'tlak' && rok != 1}
		<label class="form-floating d-block mb-2">
			<input
				type="text"
				class="form-control"
				value={prvniKontrola?.[v.key1]?.[v.key2] ?? ''}
				disabled
			/>
			<label for="">{name}</label>
		</label>
	{/if}
{/each}
<label class="form-floating d-block mb-2">
	<input type="text" placeholder="Poznámka" class="form-control" bind:value={poznamka} />
	<label for="">Poznámka</label>
</label>
<div class="d-inline-flex align-content-center">
	{#if !vysledek.load}
		<button on:click={save} class="btn btn-success">{t.save}</button>
	{/if}
	{#if vysledek.load}
		<div class="spinner-border text-danger ms-2" />
	{/if}
	<p class:text-danger={vysledek.red} class="ms-2 my-auto">{@html vysledek.text}</p>
</div>
