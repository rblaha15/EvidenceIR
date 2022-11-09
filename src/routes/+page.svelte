<script lang="ts">
	import Pisatko from '../lib/Pisatko.svelte';
	import Vybiratko from '../lib/Vybiratko.svelte';
	import { Vec } from '../lib/Vec';

	$: data = {
		cisloIR: Vec.Pisatkova(
			'Sériové číslo regulátoru:',
			'Zadejte číslo ve správném formátu!',
			/^([A-Z][1-9OND]) ([0-9]{4})$/
		),
		typIR: Vec.Vybiratkova('Typ regulátoru:', [
			'IR RegulusBOX CTC',
			'IR RegulusBOX RTC',
			'IR 14 CTC',
			'IR 14 RTC',
			'IR 12 CTC',
			'Jiný'
		]),
		clovek: {
			jmeno: Vec.Pisatkova('Jméno'),
			prijmeni: Vec.Pisatkova('Příjmení'),
			adresa: Vec.Pisatkova('Adresa'),
			datumNarozeni: Vec.Pisatkova(
				'Datum narození',
				'Zadejte datum ve správném formátu',
				/^(0?[1-9]|[12][0-9]|3[01]). ?(0?[1-9]|1[0-2]). ?([0-9][0-9])?[0-9][0-9]$/
			),
			email: Vec.Pisatkova(
				'Email',
				'zadejte email ve správném formátu',
				/^[\w\.]+@([\w-]+\.)+[\w-]{2,4}$/
			),
			telefon: Vec.Pisatkova(
				'Telefon',
				'Zadejte telefoní číslo ve správném formátu',
				/^(\+\d{1,3}\s)?\(?\d{3}\)?[\s\.-]?\d{3}[\s\.-]?\d{3,4}$/
			)
		},
		montazniFirma: {
			ico: Vec.Pisatkova('IČO', 'Zadejte IČO ve správném formátu', /^[0-9]{8}$/),
			jmenoZastupce: Vec.Pisatkova('Jméno zástupce'),
			email: Vec.Pisatkova(
				'Email',
				'zadejte email ve správném formátu',
				/^[\w\.]+@([\w-]+\.)+[\w-]{2,4}$/
			)
		},
		uvedeniDoProvozu: {
			ico: Vec.Pisatkova('IČO', 'Zadejte IČO ve správném formátu', /^[0-9]{8}$/),
			jmenoZastupce: Vec.Pisatkova('Jméno zástupce'),
			email: Vec.Pisatkova(
				'Email',
				'zadejte email ve správném formátu',
				/^[\w\.]+@([\w-]+\.)+[\w-]{2,4}$/
			)
		}
	};

	const odeslat = async () => {
		// TODO: Kontrolovat chyby
		const message = {
			from: 'aplikace.regulus@centrum.cz',
			//to: 'radek.blaha.15@gmail.com',
			to: 'blahova@regulus.cz',
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

	<p><Vybiratko {...data.typIR} /></p>
	<p><Pisatko {...data.cisloIR} /></p>
	<h2>Koncový uživatel</h2>
	<p><Pisatko {...data.clovek.jmeno} /></p>
	<p><Pisatko {...data.clovek.prijmeni} /></p>
	<p><Pisatko {...data.clovek.adresa} /></p>
	<p><Pisatko {...data.clovek.datumNarozeni} /></p>
	<p><Pisatko {...data.clovek.telefon} /></p>
	<p><Pisatko {...data.clovek.email} /></p>
	<h2>Montážní firma</h2>
	<p><Pisatko {...data.montazniFirma.ico} /></p>
	<p><Pisatko {...data.montazniFirma.jmenoZastupce} /></p>
	<p><Pisatko {...data.montazniFirma.email} /></p>
	<h2>Uvedení do provozu</h2>
	<p><Pisatko {...data.uvedeniDoProvozu.ico} /></p>
	<p><Pisatko {...data.uvedeniDoProvozu.jmenoZastupce} /></p>
	<p><Pisatko {...data.uvedeniDoProvozu.email} /></p>

	<button type="button" class="btn btn-primary" on:click={odeslat}> Odeslat </button>
</main>

<svelte:head>
	<title>Evidence regulátorů IR</title>
	<link
		href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css"
		rel="stylesheet"
	/>
	<script
		src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/js/bootstrap.bundle.min.js"
	></script>
</svelte:head>
