<script lang="ts">
	import Pisatko from '../lib/Pisatko.svelte';
	import Vybiratko from '../lib/Vybiratko.svelte';
	import { Vec, Typ } from '../lib/Vec';
	import { dev } from '$app/environment';

	$: data = [
		Vec.Vybiratkova('Typ regulátoru:', [
			'IR RegulusBOX CTC',
			'IR RegulusBOX RTC',
			'IR 14 CTC',
			'IR 14 RTC',
			'IR 12 CTC',
			'Jiný'
		]),
		Vec.Pisatkova(
			'Sériové číslo regulátoru:',
			'Zadejte číslo ve správném formátu!',
			/^([A-Z][1-9OND]) ([0-9]{4})$/
		),

		Vec.Nadpisova('Koncový uživatel'),
		Vec.Pisatkova('Jméno'),
		Vec.Pisatkova('Příjmení'),
		Vec.Pisatkova('Adresa'),
		Vec.Pisatkova(
			'Datum narození',
			'Zadejte datum ve správném formátu',
			/^(0?[1-9]|[12][0-9]|3[01]). ?(0?[1-9]|1[0-2]). ?[0-9]{4}$/
		),
		Vec.Pisatkova(
			'Telefon',
			'Zadejte telefoní číslo ve správném formátu',
			/^(\+\d{1,3}\s)?\(?\d{3}\)?[\s\.-]?\d{3}[\s\.-]?\d{3,4}$/
		),
		Vec.Pisatkova('Email', 'Zadejte email ve správném formátu', /^[\w\.]+@([\w-]+\.)+[\w-]{2,4}$/),

		Vec.Nadpisova('Montážní firma'),
		Vec.Pisatkova('IČO', 'Zadejte IČO ve správném formátu', /^[0-9]{8}$/),
		Vec.Pisatkova('Jméno zástupce'),
		Vec.Pisatkova('Email', 'Zadejte email ve správném formátu', /^[\w\.]+@([\w-]+\.)+[\w-]{2,4}$/),

		Vec.Nadpisova('Uvedení do provozu'),
		Vec.Pisatkova('IČO', 'Zadejte IČO ve správném formátu', /^[0-9]{8}$/),
		Vec.Pisatkova('Jméno zástupce'),
		Vec.Pisatkova('Email', 'zadejte email ve správném formátu', /^[\w\.]+@([\w-]+\.)+[\w-]{2,4}$/)
	];

	const odeslat = async () => {

		console.log(!data.every(it => !it.zpravaJeChybna))

		if (!data.every(it => !it.zpravaJeChybna)) {
			for(let i = 0; i < data.length; i++)
			return
		}

		const message = {
			from: 'aplikace.regulus@centrum.cz',
			to: dev ? 'radek.blaha.15@gmail.com' : 'blahova@regulus.cz',
			subject: 'Další Pokus',
			text: JSON.stringify(data)
		};

		console.log(data);

		const response = await fetch('/poslatEmail', {
			method: 'POST',
			body: JSON.stringify({ message }),
			headers: {
				'content-type': 'application/json'
			}
		});

		console.log(response);
	};
</script>

<main class="container">
	<h1>Evidence regulátorů IR</h1>

	{#each data as vec}
		{#if vec.typ == Typ.Nadpis}
			<h2>{vec.nazev}</h2>
		{:else if vec.typ == Typ.Pisatkovy}
			<p><Pisatko {vec} /></p>
		{:else if vec.typ == Typ.Vybiratkovy}
			<p><Vybiratko {vec} /></p>
		{:else if vec.typ == Typ.Zaskrtavatkovy}
			<!-- TODO -->
		{/if}
	{/each}

	<button id="odeslat" type="button" class="btn btn-primary" on:click={odeslat}> Odeslat </button>
</main>

<style>
	#odeslat {
		background-color: #ed2939;
		border-color: #ed2939;
	}
</style>
