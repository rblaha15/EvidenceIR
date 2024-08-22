<script lang="ts">
	import { evidence, posledniKontrola, pridatKontrolu } from '$lib/client/firestore';
	import {
		kontrola,
		kontrolaTypes,
		nazvyKontrol,
		orderArray,
		type Kontrola,
		type KontrolaAsRecord,
		type KontrolaBezMety,
		type NazvyAsRecord
	} from '$lib/Kontrola';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import Navigation from '$lib/components/Navigation.svelte';

	export let data: PageData;
	const ir = data.ir;
	const t = data.translations;

	const k = kontrola('cs', 'Já', 'dnes') as KontrolaAsRecord;
	const n = nazvyKontrol as NazvyAsRecord;

	const f = (v: { key1: keyof KontrolaBezMety; key2: string }, ev: Event) => {
		// @ts-expect-error
		k[v.key1][v.key2] = (ev.target?.value as string | undefined) ?? '';
	};

	let rok: number | undefined;
	let prvniKontrola: KontrolaAsRecord | undefined;
	let nacita = true;
	onMount(async () => {
		nacita = false;
		rok = (await posledniKontrola(ir)) + 1;
		const snapshot = await evidence(ir);
		prvniKontrola = snapshot.data()?.kontroly?.[1];
	});

	const save = () => {
		pridatKontrolu(ir, rok!, k as Kontrola);
	};
</script>

{#if nacita}
	<div class="d-flex justify-content-start align-items-center">
		<div class="spinner-border text-danger me-2" />
	</div>
{:else}
	<Navigation {t} />
	<main class="my-3 container">
		<h1>{t.yearlyCheck}</h1>
		{#each orderArray as v}
			{@const value = k[v.key1][v.key2]}
			{@const type = kontrolaTypes[v.key1][v.key2]}
			{@const name = type == 'nadpis' ? nazvyKontrol[`${v.key1}Name`] : n[v.key1][v.key2]}
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
						on:input={(e) => f(v, e)}
					/>
				</p>
			{:else if type == 'tlak' && rok != 1}
			<p>
				<input
					type="text"
					class="form-control d-block"
					value={name + " " + (prvniKontrola?.[v.key1]?.[v.key2] ?? '')}
					disabled
				/>
			</p>
			{/if}
		{/each}
		<button on:click={save} class="btn btn-primary">{t.save}</button>
	</main>
{/if}
