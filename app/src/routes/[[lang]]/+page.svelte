<script lang="ts">
	import { DvojVybiratko, Pisatko, Vybiratko } from '$lib/components/veci';
	import { MultiZaskrtavatko, Radio, Zaskrtavatko } from '$lib/components/veci';
	import Navigation from '$lib/components/Navigation.svelte';
	import VybiratkoFirmy from '$lib/components/VybiratkoFirmy.svelte';
	import Scanner from '$lib/components/Scanner.svelte';

	import * as v from '$lib/Vec';
	import { Data } from '$lib/Data';
	import { friendlyCompanies, responsiblePerson } from '$lib/client/realtime';
	import { chosenCompanies, companies, filteredCompanies } from './companies';
	import odeslat from './odeslat';

	import { dev } from '$app/environment';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	const t = $page.data.translations;

	let nacita = true;
	onMount(() => (nacita = false));

	const data = Data(dev);

	friendlyCompanies.subscribe(c => {
		if (c.assemblyCompanies.length == 1) {
			data.montazka.ico.updateText(c.assemblyCompanies[0].crn);
			data.montazka.email.text = c.assemblyCompanies[0].email ?? '';
			data.montazka.zastupce.text = c.assemblyCompanies[0].representative ?? '';
		}
		if (c.commissioningCompanies.length == 1) {
			data.uvedeni.ico.updateText(c.commissioningCompanies[0].crn);
			data.uvedeni.email.text = c.commissioningCompanies[0].email ?? '';
			data.uvedeni.zastupce.text = c.commissioningCompanies[0].representative ?? '';
		}
	});

	$: {
		data.ostatni.zodpovednaOsoba.zobrazit = () => $responsiblePerson == null;
		if ($responsiblePerson != null) data.ostatni.zodpovednaOsoba.text = $responsiblePerson;
	}
	$: {
		if (data.uvedeni.jakoMontazka.zaskrtnuto) {
			data.uvedeni.ico.updateText('');
			data.uvedeni.zastupce.text = '';
			data.uvedeni.email.text = '';
		} else if (
			data.uvedeni.ico.text == data.montazka.ico.text &&
			data.uvedeni.ico.text != '' &&
			data.uvedeni.zastupce.text == data.montazka.zastupce.text &&
			data.uvedeni.zastupce.text != '' &&
			data.uvedeni.email.text == data.montazka.email.text &&
			data.uvedeni.email.text != ''
		) {
			data.uvedeni.jakoMontazka.zaskrtnuto = true;
			data.uvedeni.ico.updateText('');
			data.uvedeni.zastupce.text = '';
			data.uvedeni.email.text = '';
		}
	}
	$: {
		if (!data.tc.typ.moznosti({ t, data }).includes(data.tc.typ.value({ t, data }))) {
			data.tc.typ.vybrano = null;
		}
	}

	let filter = '';
	$: filtered = filteredCompanies(filter)
	$: chosen = chosenCompanies(data.montazka.ico.text, data.uvedeni.ico.text)

	$: list = (Object.values(data) as Data[keyof Data][]).flatMap(
		(obj) => Object.values(obj) as v.Vec<any>[]
	);

	let vysledek = {
		text: '',
		red: false,
		load: false
	};
	let doNotSend = false;
</script>

{#if nacita}
	<div class="spinner-border text-danger m-2" />
{:else}
	<Navigation {t} />
	<main class="container my-3">
		<hr class="d-md-none" />
		{#each list as vec}
			{#if vec === data.montazka.ico && vec.zobrazit({ t, data })}
				<p>{t.chosenCompany}: {$chosen.assemblyCompanies ?? t.unknown_Company}</p>
				{#if $companies.assemblyCompanies.length > 1}
					<VybiratkoFirmy
						id="montazka"
						bind:emailVec={data.montazka.email}
						bind:zastupceVec={data.montazka.zastupce}
						bind:icoVec={data.montazka.ico}
						bind:filtr={filter}
						vyfiltrovanyFirmy={$filtered.assemblyCompanies}
						{t}
					/>
				{/if}
			{/if}
			{#if vec === data.uvedeni.ico && vec.zobrazit({ t, data })}
				<p>{t.chosenCompany}: {$chosen.commissioningCompanies ?? t.unknown_Company}</p>
				{#if $companies.commissioningCompanies.length > 1}
					<VybiratkoFirmy
						id="uvedeni"
						bind:emailVec={data.uvedeni.email}
						bind:zastupceVec={data.uvedeni.zastupce}
						bind:icoVec={data.uvedeni.ico}
						bind:filtr={filter}
						vyfiltrovanyFirmy={$filtered.commissioningCompanies}
						{t}
					/>
				{/if}
			{/if}
			{#if vec === data.tc.cislo && vec.zobrazit({ t, data })}
				<Scanner
					bind:vec={data.tc.cislo}
					zobrazit={data.ir.typ.vybrano2 == 0}
					onScan={(text) => (data.tc.cislo.text = text.slice(8))}
					{t}
					{data}
				/>
			{:else if vec instanceof v.Nadpisova && vec.zobrazit({ t, data })}
				<h2>{vec.nazev({ t, data })}</h2>
			{:else if vec instanceof v.Textova && vec.zobrazit({ t, data })}
				<p>{vec.nazev({ t, data })}</p>
			{:else if vec instanceof v.Pisatkova && vec.zobrazit({ t, data })}
				<p><Pisatko bind:vec {t} {data} /></p>
			{:else if vec instanceof v.DvojVybiratkova && vec.zobrazit({ t, data })}
				<p><DvojVybiratko bind:vec {t} {data} /></p>
			{:else if vec instanceof v.Vybiratkova && vec.zobrazit({ t, data })}
				<p><Vybiratko bind:vec {t} {data} /></p>
			{:else if vec instanceof v.Radiova && vec.zobrazit({ t, data })}
				<p><Radio bind:vec {t} {data} /></p>
			{:else if vec instanceof v.MultiZaskrtavatkova && vec.zobrazit({ t, data })}
				<p><MultiZaskrtavatko bind:vec {t} {data} /></p>
			{:else if vec instanceof v.Zaskrtavatkova && vec.zobrazit({ t, data })}
				<p><Zaskrtavatko bind:vec {t} {data} /></p>
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

		<div class="d-inline-flex">
			<button
				id="odeslat"
				type="button"
				class="btn btn-success"
				on:click={() => odeslat(data, (v) => (vysledek = v), doNotSend)}
			>
				{t.save}
			</button>

			{#if vysledek.load}
				<div class="spinner-border text-danger ms-2" />
			{/if}
			<p class:text-danger={vysledek.red} class="ms-2 my-auto">{@html vysledek.text}</p>
		</div>
	</main>
{/if}
