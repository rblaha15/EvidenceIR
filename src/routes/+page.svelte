<script lang="ts">
	import Pisatko from '../lib/Pisatko.svelte';
	import Vybiratko from '../lib/Vybiratko.svelte';

	$: data = {
		cisloIR: '',
		typIR: '',
		clovek: {
			jmeno: '',
			prijmeni: '',
			adresa: '',
			datumNarozeni: '',
			email: '',
			telefon: ''
		},
        montazniFirma: {
            ico: "",
            jmenoZastupce: "",
            email: "",
        },
        uvedeniDoProvozu: {
            ico: "",
            jmenoZastupce: "",
            email: "",
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

        console.log(response)
	};
</script>

<main class="container">
	<h1>Evidence regulátorů IR</h1>

	<p><Vybiratko bind:vybrano={data.typIR} moznosti={['Něco', 'Něco jinýho']} nazev="Typ regulátoru:" /></p>
	<p><Pisatko bind:text={data.cisloIR} nazev="Sériové číslo regulátoru:" /></p>
	<h2>Koncový uživatel</h2>
	<p><Pisatko bind:text={data.clovek.jmeno} nazev="Jméno" /></p>
	<p><Pisatko bind:text={data.clovek.prijmeni} nazev="Příjmení" /></p>
	<p><Pisatko bind:text={data.clovek.adresa} nazev="Adresa" /></p>
	<p><Pisatko bind:text={data.clovek.datumNarozeni} nazev="Datum narození" /></p>
	<p><Pisatko bind:text={data.clovek.telefon} nazev="Telefon" /></p>
	<p><Pisatko bind:text={data.clovek.email} nazev="Email" /></p>
	<h2>Montážní firma</h2>
	<p><Pisatko bind:text={data.montazniFirma.ico} nazev="IČO" /></p>
	<p><Pisatko bind:text={data.montazniFirma.jmenoZastupce} nazev="Jméno zástupce" /></p>
	<p><Pisatko bind:text={data.montazniFirma.email} nazev="Email" /></p>
	<h2>Uvedení do provozu</h2>
	<p><Pisatko bind:text={data.uvedeniDoProvozu.ico} nazev="IČO" /></p>
	<p><Pisatko bind:text={data.uvedeniDoProvozu.jmenoZastupce} nazev="Jméno zástupce" /></p>
	<p><Pisatko bind:text={data.uvedeniDoProvozu.email} nazev="Email" /></p>

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
