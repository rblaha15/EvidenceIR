<script lang="ts">
	import { odstranitUzivatele, uzivatel } from '$lib/firebase';
	import { onMount } from 'svelte';
	import type { Data } from '$lib/Vec';
	import Mail from '$lib/mails/MailPoPotvrzeni.svelte';
	import { htmlToText } from 'html-to-text';
	import { dev } from '$app/environment';

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

		const montazka = (await nazevFirmy(fireData.montazka.ico.text)) ?? null;
		const uvadec = (await nazevFirmy(fireData.uvedeni.ico.text)) ?? null;

		const div = document.createElement('div');
		new Mail({
			target: div,
			props: { data: fireData, montazka, uvadec }
		});

		const html = div.innerHTML;
		const text = htmlToText(html);

		const message2 = {
			from: '"Webová aplikace evidence IR" aplikace.regulus@centrum.cz',
			to: 'radek.blaha.15@gmail.com',
			subject: `Nově zaevidovaný regulátor ${fireData.ir.typ.vybrano} (${fireData.ir.cislo.text})`,
			html,
			text
		};
		console.log(message2);
		const response = await fetch(`/api/poslatEmail`, {
			method: 'POST',
			body: JSON.stringify({ message: message2 }),
			headers: {
				'content-type': 'application/json'
			}
		});

		console.log(response);

		poslano = response.ok;
		posila = false;

		if (!poslano) return;

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
