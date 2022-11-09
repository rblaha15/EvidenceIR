<script lang="ts">
	import Pisatko from '../lib/Pisatko.svelte';
	import Vybiratko from '../lib/Vybiratko.svelte';
	import { Vec } from '../lib/Vec';

	$: data = {
		cisloIR: new Vec('Sériové číslo regulátoru:'),
		typIR: new Vec('Typ regulátoru:', [
			'IR RegulusBOX CTC',
			'IR RegulusBOX RTC',
			'IR 14 CTC',
			'IR 14 RTC',
			'IR 12 CTC',
			'Jiný'
		]),
		clovek: {
			jmeno: new Vec('Jméno'),
			prijmeni: new Vec('Příjmení'),
			adresa: new Vec('Adresa'),
			datumNarozeni: new Vec('Datum narození'),
			email: new Vec('Email'),
			telefon: new Vec('Telefon')
		},
		montazniFirma: {
			ico: new Vec('IČO'),
			jmenoZastupce: new Vec('Jméno zástupce'),
			email: new Vec('Email')
		},
		uvedeniDoProvozu: {
			ico: new Vec('IČO'),
			jmenoZastupce: new Vec('Jméno zástupce'),
			email: new Vec('Email')
		}
	};

	const odeslat = async () => {
		const message = {
			from: 'aplikace.regulus@centrum.cz',
			to: 'radek.blaha.15@gmail.com',
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
