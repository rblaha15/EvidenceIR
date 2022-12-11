<script lang="ts">
	import { odstranitUzivatele, uzivatel } from '$lib/firebase';
	import { onMount } from 'svelte';
	import type { Data } from '$lib/Vec';
	import MailPoPotvrzeni from '$lib/mails/MailPoPotvrzeni.svelte';
	import { dev } from '$app/environment';
	import { poslatEmail, sender } from '$lib/constants';

	export let data: { uid: string; souhlas: boolean };

	let nacita = true;
	let existuje: boolean;
	let posila = true;
	let poslano: boolean;

	const nazevFirmy = async (ico: string) => {
		const response = await fetch(`/api/getWebsite`, {
			method: 'POST',
			body: JSON.stringify({
				url: `http://wwwinfo.mfcr.cz/cgi-bin/ares/ares_es.cgi?ico=${ico}`
			})
		});
		// console.log(response);
		const text = await response.text();

		// console.log(text);
		const doc = new DOMParser().parseFromString(text, 'text/xml');
		console.log(doc);

		return doc
			.querySelector('Ares_odpovedi')
			?.querySelector('Odpoved')
			?.querySelector('V')
			?.querySelector('S')
			?.querySelector('ojm')?.textContent;
	};

	onMount(async () => {
		console.log(data);
		let snapshot;
		try {
			snapshot = await uzivatel(data.uid);
		} catch {
			console.log('Nepovedlo se načíst data z firebase');
			existuje = false;
			nacita = false;
			return;
		}
		console.log(snapshot);

		existuje = snapshot.exists();
		nacita = false;
		if (!existuje) return;

		const dataJson = (snapshot.data() as { veci: string }).veci;
		const fireData = JSON.parse(dataJson) as Data;
		// Máme data o zákazníkovi z fiebase!

		if (data.souhlas) {
			const montazka = (await nazevFirmy(fireData.montazka.ico.text)) ?? null;
			const uvadec = (await nazevFirmy(fireData.uvedeni.ico.text)) ?? null;

			const div = document.createElement('div');
			new MailPoPotvrzeni({
				target: div,
				props: { data: fireData, montazka, uvadec }
			});

			const response = await poslatEmail({
				from: sender,
				to: dev ? 'radek.blaha.15@gmail.com' : 'blahova@regulus.cz',
				subject: `Nově zaevidovaný regulátor ${fireData.ir.typ.vybrano} (${fireData.ir.cislo.text})`,
				html: div.innerHTML
			});
			console.log(response);

			poslano = response.ok;
			posila = false;
		} else {
			const response = await poslatEmail({
				from: sender,
				to: dev ? 'radek.blaha.15@gmail.com' : 'blahova@regulus.cz',
				subject: `Nově zaevidovaný regulátor ${fireData.ir.typ.vybrano} (${fireData.ir.cislo.text})`,
				html: `<p>Zákazník ${fireData.koncovyUzivatel.jmeno} ${fireData.koncovyUzivatel.prijmeni} se rozhodl nesouhlasit se založením vzdáleného přístupu!</p>`
			});

			console.log(response);

			poslano = response.ok;
			posila = false;
		}
		if (!poslano) return;
		// Dokázali jsme odeslat email!

		odstranitUzivatele(data.uid);
	});
</script>

<main class="my-3 container">
	<h1>Potvrzení o založení vzdáleného přístupu</h1>

	{#if nacita}
		<div class="d-flex justify-content-center align-items-center">
			<div class="spinner-border me-2" />
			<span>Načítání dat...</span>
		</div>
		<p>Prosíme, čekejte a nezavírejte toto okno!</p>
	{:else if !existuje}
		<p>Omlouváme se, něco se nepovedlo.</p>
		<p>Buď je odkaz na tuto stránku nesprávný, nebo jste již jednou souhlas potvrzoval/a.</p>
		<p>V každém případě prosíme kontaktujte svého zástupce Vaší montážní firmy.</p>
	{:else if posila}
		<div class="d-flex justify-content-center align-items-center">
			<div class="spinner-border" />
			<span>Odesílání emailů...</span>
		</div>
		<p>Prosíme, čekejte a nezavírejte toto okno!</p>
	{:else if !poslano}
		<p>Omlouváme se, email se nepodařil odeslat.</p>
		<p>Prosíme, kontaktujte svého zástupce Vaší montážní firmy.</p>
	{:else}
		<p>Úspěšně potvrzeno!</p>
		<p>Podařilo se nám zařídit všechno potřebné, nyní můžete zavřít toto okno.</p>
	{/if}
</main>
