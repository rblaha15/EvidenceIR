<script lang="ts">
	import Pisatko from '../lib/Pisatko.svelte';
	import Vybiratko from '../lib/Vybiratko.svelte';
	import { Vec, Typ } from '../lib/Vec';
	import { dev } from '$app/environment';

	const defaultData = [
		Vec.Vybiratkova('Typ regulátoru', [
			'IR RegulusBOX CTC',
			'IR RegulusBOX RTC',
			'IR 14 CTC',
			'IR 14 RTC',
			'IR 12 CTC',
			'Jiný'
		]),
		Vec.Pisatkova(
			'Sériové číslo regulátoru',
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
		Vec.Pisatkova('Email', 'Zadejte email ve správném formátu', /^[\w\.]+@([\w-]+\.)+[\w-]{2,4}$/)
	];

	let data = JSON.parse(JSON.stringify(defaultData)) as Array<Vec>;

	const odeslat = async () => {
		console.log(!data.every((it) => !it.zpravaJeChybna));

		if (!data.every((it) => !it.zpravaJeChybna)) {
			for (let i = 0; i < data.length; i++) {
				data[i].zobrazitErrorVeto = true;
			}
			return;
		}

		const html = data
			.map((vec) => {
				switch (vec.typ) {
					case Typ.Nadpis:
						return `<h2>${vec.nazev}</h2>`;
					case Typ.Pisatkovy:
						return `<p>${vec.nazev}: ${vec.text}</p>`;
					case Typ.Vybiratkovy:
						return `<p>${vec.nazev}: ${vec.vybrano}</p>`;
					case Typ.Zaskrtavatkovy:
						return `<p>${vec.nazev}: ${vec.bool ? 'Ano' : 'Ne'}</p>`;
				}
			})
			.join('');

		const text = data
			.map((vec) => {
				switch (vec.typ) {
					case Typ.Nadpis:
						return `${vec.nazev}\n`;
					case Typ.Pisatkovy:
						return `${vec.nazev}: ${vec.text}`;
					case Typ.Vybiratkovy:
						return `${vec.nazev}: ${vec.vybrano}`;
					case Typ.Zaskrtavatkovy:
						return `${vec.nazev}: ${vec.bool ? 'Ano' : 'Ne'}`;
				}
			})
			.join('\n');

		const message = {
			from: '"Webová aplikace evidence IR" aplikace.regulus@centrum.cz',
			to: dev ? 'radek.blaha.15@gmail.com' : 'blahova@regulus.cz',
			subject: `Nově zaevidovaný regulátor ${data[0].vybrano} (${data[1].text})`,
			text,
			html
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

		if (response.ok) {
			console.log(data, defaultData);
			data = JSON.parse(JSON.stringify(defaultData));
		}
	};
</script>

<main class="my-3 container">
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
