<script lang="ts">
	import { evidence, posledniKontrola, pridatKontrolu } from '$lib/client/firestore';
	import {
		kontrola,
		kontrolaTypes,
		checkNames,
		orderArray,
		type Kontrola,
		type KontrolaAsRecord,
		type KontrolaBezMety,
		type NamesRecord
	} from '$lib/Kontrola';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { today } from '$lib/helpers/date';

	export let data: PageData;
	const ir = data.ir;
	const t = data.translations;

	let uvadec: string = '';
	const k = kontrola(data.languageCode, 'uvaděč', today()) as KontrolaAsRecord;
	const n = checkNames[data.languageCode] as NamesRecord;

	let rok: number | undefined;
	let prvniKontrola: KontrolaAsRecord | undefined;
	let nacita = true;
	onMount(async () => {
		nacita = false;
		rok = (await posledniKontrola(ir as string)) + 1;
		const snapshot = await evidence(ir as string);
		prvniKontrola = snapshot.data()?.kontroly?.[1];
	});

	let vysledek = {
		text: '',
		red: false,
		load: false
	};

	const save = async () => {
		vysledek = { load: true, red: false, text: t.saving };
		k.meta.osoba = uvadec;
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

<input
	type="text"
	placeholder={t.get('performingPerson')}
	class="form-control d-block"
	bind:value={uvadec}
/>

{#each orderArray as v}
	{@const value = k[v.key1][v.key2]}
	{@const type = kontrolaTypes[v.key1][v.key2]}
	{@const name = type == 'nadpis' ? n[`${v.key1}Name`] : n[v.key1][v.key2]}
	{#if type == 'nadpis'}
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
		<p>
			<input
				type="text"
				class="form-control d-block"
				placeholder={name}
				value={value ?? ''}
				on:input={(e) => {
					k[v.key1][v.key2] = e.currentTarget.value;
				}}
			/>
		</p>
	{:else if type == 'tlak' && rok != 1}
		<p>
			<input
				type="text"
				class="form-control d-block"
				value={name + ' ' + (prvniKontrola?.[v.key1]?.[v.key2] ?? '')}
				disabled
			/>
		</p>
	{/if}
{/each}
<div class="d-inline-flex align-content-center">
	{#if !vysledek.load}
		<button on:click={save} class="btn btn-success">{t.save}</button>
	{/if}
	{#if vysledek.load}
		<div class="spinner-border text-danger ms-2" />
	{/if}
	<p class:text-danger={vysledek.red} class="ms-2 my-auto">{@html vysledek.text}</p>
</div>
