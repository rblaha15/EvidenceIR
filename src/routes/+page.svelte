<script lang="ts">
	// Components
	import Pisatko from '$lib/components/Pisatko.svelte';
	import Vybiratko from '$lib/components/Vybiratko.svelte';
	import Zaskrtavatko from '$lib/components/Zaskrtavatko.svelte';
	import MultiZaskrtavatko from '$lib/components/MultiZaskrtavatko.svelte';
	import Radio from '$lib/components/Radio.svelte';
	import Firma from '$lib/components/Firma.svelte';

	// Other
	import {
		type Data,
		Vybiratkova,
		Pisatkova,
		Radiova,
		Nadpisova,
		Zaskrtavatkova,
		MultiZaskrtavatkova,
		Vec
	} from '$lib/Vec';
	import { seznamFirem, novyUzivatel } from '$lib/firebase';

	// Svelte
	import { dev } from '$app/environment';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	const url = dev ? 'http://localhost:5174/api' : 'https://evidenceir.cyclic.app/api';

	onMount(async () => {
		const response = await fetch(url, {
			method: 'GET'
		});
		console.log(response);
	});

	let filtr = '';

	$: vyfiltrovanyFirmy = $seznamFirem
		.map(([jmeno, ico, email, zastupce]) => [jmeno.normalize(), ico, email, zastupce])
		.filter(([jmeno]) =>
			filtr
				.toLowerCase()
				.split(' ')
				.every((slovoFiltru) =>
					jmeno
						.toLowerCase()
						.split(' ')
						.some((slovoJmena) => slovoJmena.startsWith(slovoFiltru))
				)
		);

	const data: Data = {
		ir: {
			typ: new Vybiratkova('Typ regulátoru', [
				'IR RegulusBOX CTC',
				'IR RegulusBOX RTC',
				'IR 14 CTC',
				'IR 14 RTC',
				'IR 12 CTC'
			]),
			cislo: new Pisatkova(
				'Sériové číslo regulátoru',
				'Zadejte číslo ve správném formátu!',
				/([A-Z][1-9OND]) ([0-9]{4})/,
				true,
				'A9 1234'
			)
		},
		tc: {
			druh: new Radiova('Druh tepelného čerpadla', ['vzduch/voda', 'země/voda'], undefined, false),
			typ: new Vybiratkova('Typ tepelného čerpadla', [], undefined, false),
			cislo: new Pisatkova(
				'Výrobní číslo tepelného čerpadla',
				'Zadejte číslo ve správném formátu',
				undefined,
				false
			)
		},
		koncovyUzivatel: {
			nadpis: new Nadpisova('Koncový uživatel'),
			jmeno: new Pisatkova('Jméno'),
			prijmeni: new Pisatkova('Příjmení'),
			narozeni: new Pisatkova(
				'Datum narození',
				'Zadejte datum ve správném formátu',
				/^(0?[1-9]|[12][0-9]|3[01]). ?(0?[1-9]|1[0-2]). ?[0-9]{4}$/
			),
			telefon: new Pisatkova(
				'Telefon',
				'Zadejte telefoní číslo ve správném formátu',
				/^(\+\d{1,3}\s)?\(?\d{3}\)?[\s\.-]?\d{3}[\s\.-]?\d{3,4}$/
			),
			email: new Pisatkova(
				'Email',
				'Zadejte email ve správném formátu',
				/^[\w\.-]+@([\w-]+\.)+[\w-]{2,4}$/
			)
		},
		mistoRealizace: {
			nadpis: new Nadpisova('Místo realizace'),
			obec: new Pisatkova('Obec'),
			ulice: new Pisatkova('Číslo popisné nebo ulice a číslo orientační'),
			psc: new Pisatkova(
				'Poštovní směrovací číslo',
				'ZAdejte PSČ ve správném formátu',
				/^\d{3} \d{2}$/,
				true,
				'123 45'
			)
		},
		montazka: {
			nadpis: new Nadpisova('Montážní firma'),
			ico: new Pisatkova('IČO', 'Zadejte IČO ve správném formátu', /^\d{8}$/, true, '12345678'),
			zastupce: new Pisatkova('Jméno zástupce'),
			email: new Pisatkova(
				'Email',
				'Zadejte email ve správném formátu',
				/^[\w\.-]+@([\w-]+\.)+[\w-]{2,4}$/
			)
		},
		uvedeni: {
			nadpis: new Nadpisova('Uvedení do provozu'),
			jakoMontazka: new Zaskrtavatkova('Do provozu uváděla montážní firma', undefined, false),
			ico: new Pisatkova('IČO', 'Zadejte IČO ve správném formátu', /^\d{8}$/, true, '12345678'),
			zastupce: new Pisatkova('Jméno zástupce'),
			email: new Pisatkova(
				'Email',
				'Zadejte email ve správném formátu',
				/^[\w\.-]+@([\w-]+\.)+[\w-]{2,4}$/
			)
		},
		vzdalenyPristup: {
			nadpis: new Nadpisova('Vzdálený přístup'),
			chce: new Zaskrtavatkova('Chcete založit vzdálený přístup k regulátoru?'),
			pristupMa: new MultiZaskrtavatkova('Kdo k němu bude mít přístup?', [
				'Koncový zákazník',
				'Montážní firma',
				'Firma uvádějicí do provozu'
			]),
			fakturuje: new Radiova('Komu bude vzdálený přístup fakturován? (jednorázová cena 500 Kč)', [
				'Montážní firma',
				'Koncový zákazník',
				'Nefakturovat'
			])
		}
	};

	if (dev) {
		data.ir.typ.vybrano = 'IR 14 CTC';
		data.ir.cislo.text = 'A9 1234';
		data.tc.druh.vybrano = 'vzduch/voda';
		data.tc.typ.vybrano = 'EcoAir 408';
		data.tc.cislo.text = '3514-3564-6321';
		data.koncovyUzivatel.jmeno.text = 'Radek';
		data.koncovyUzivatel.prijmeni.text = 'Bláha';
		data.koncovyUzivatel.narozeni.text = '15. 3. 2007';
		data.koncovyUzivatel.telefon.text = '+420 792 313 555';
		data.koncovyUzivatel.email.text = 'radek.blaha.15@gmail.com';
		data.mistoRealizace.obec.text = 'České Budějovice';
		data.mistoRealizace.ulice.text = 'Josefa Hory 18';
		data.mistoRealizace.psc.text = '370 06';
		data.vzdalenyPristup.chce.zaskrtnuto = true;
	}

	$: seznam = (Object.values(data) as Object[]).flatMap((obj) => Object.values(obj) as Vec[]);

	let vysledek = {
		text: '',
		success: true
	};

	const odeslat = async () => {
		if (!seznam.every((it) => !it.zpravaJeChybna)) {
			for (let i = 0; i < seznam.length; i++) {
				seznam[i].zobrazitErrorVeto = true;
			}
			return;
		}

		const message1 = {
			from: '"Webová aplikace evidence IR" aplikace.regulus@centrum.cz',
			to: dev ? 'radek.blaha.15@gmail.com' : 'blahova@regulus.cz',
			subject: `Nově zaevidovaný regulátor ${data.ir.typ.vybrano} (${data.ir.cislo.text})`,
			text: seznam
				.map((vec) => {
					if (vec instanceof Nadpisova) return `${vec.nazev}\n`;
					if (vec instanceof Pisatkova) return `${vec.nazev}: ${vec.text}`;
					if (vec instanceof Vybiratkova) return `${vec.nazev}: ${vec.vybrano}`;
					if (vec instanceof Radiova) return `${vec.nazev}: ${vec.vybrano}`;
					if (vec instanceof MultiZaskrtavatkova) return `${vec.nazev}: ${vec.vybrano.join(', ')}`;
					if (vec instanceof Zaskrtavatkova)
						return `${vec.nazev}: ${vec.zaskrtnuto ? 'Ano' : 'Ne'}`;
				})
				.join('\n'),
			html: seznam
				.map((vec) => {
					if (vec instanceof Nadpisova) return `<h2>${vec.nazev}</h2>\n`;
					if (vec instanceof Pisatkova) return `<p>${vec.nazev}: ${vec.text}</p>`;
					if (vec instanceof Vybiratkova) return `<p>${vec.nazev}: ${vec.vybrano}</p>`;
					if (vec instanceof Radiova) return `<p>${vec.nazev}: ${vec.vybrano}</p>`;
					if (vec instanceof MultiZaskrtavatkova)
						return `<p>${vec.nazev}: ${vec.vybrano.join(', ')}</p>`;
					if (vec instanceof Zaskrtavatkova)
						return `<p>${vec.nazev}: ${vec.zaskrtnuto ? 'Ano' : 'Ne'}</p>`;
				})
				.join('')
		};

		console.log(message1);

		if (data.vzdalenyPristup.chce) {
			const id = await novyUzivatel({ veci: JSON.stringify(data) });

			const message2 = {
				from: '"Webová aplikace evidence IR" aplikace.regulus@centrum.cz',
				to: 'radek.blaha.15@gmail.com',
				subject: `Souhlas se vzdáleným přístupem k regulátoru ${data.ir.typ.vybrano}`,
				text: `Na základě vašeho požadavku na zřízení vzdálené správy regulátoru Vašeho topného systému Vám zasíláme souhlas:

Souhlasím se vzdálenou správou uvedeného regulátoru IR prostřednictvím internetové služby RegulusRoute.
${
	data.vzdalenyPristup.fakturuje.vybrano == 'Koncový zákazník'
		? 'Souhlasím s jednorázovou cenou 500 Kč bez DPH za tuto službu.\n'
		: ''
}Přístup poskytne společnost REGULUS spol. s r.o. i servisní firmě.
Více informací o zpracovaní Vašich osobních údajů najdete v příloze tohoto emailu, která je součástí tohoto souhlasu.

Souhlasím: ${$page.url.origin}/potvrzeni/${id}/souhlas/ano
Nesouhlasím: ${$page.url.origin}/potvrzeni/${id}/souhlas/ne`,
				html: `<p>Na základě vašeho požadavku na zřízení vzdálené správy regulátoru Vašeho topného systému Vám zasíláme souhlas:</p>

<p>Souhlasím se vzdálenou správou uvedeného regulátoru IR prostřednictvím internetové služby RegulusRoute.</p>
${
	data.vzdalenyPristup.fakturuje.vybrano == 'Koncový zákazník'
		? '<p>Souhlasím s jednorázovou cenou 500 Kč bez DPH za tuto službu.</p>'
		: ''
}<p>Přístup poskytne společnost REGULUS spol. s r.o. i servisní firmě.</p>
<p>Více informací o zpracovaní Vašich osobních údajů najdete v příloze tohoto emailu, která je součástí tohoto souhlasu.</p>

<p><a href="${$page.url.origin}/potvrzeni/${id}/souhlas/ano">Souhlasím</a></p>
<p><a href="${$page.url.origin}/potvrzeni/${id}/souhlas/ne">Nesouhlasím</a></p>`,
				attachments: [
					{
						filename: 'Souhlas se zpracováním osobních údajů.pdf',
						path: 'https://raw.githubusercontent.com/rblaha15/rblaha15.github.io/main/Souhlas%20se%20zpracov%C3%A1n%C3%ADm%20osobn%C3%ADch%20%C3%BAdaj%C5%AF.pdf'
					}
				]
			};

			console.log(message2);
			const response = await fetch(`${url}/poslatEmail`, {
				method: 'POST',
				body: JSON.stringify({ message: message2 }),
				headers: {
					'content-type': 'application/json'
				}
			});

			console.log(response);
		}

		const response = await fetch(`${url}/poslatEmail`, {
			method: 'POST',
			body: JSON.stringify({ message: message1 }),
			headers: {
				'content-type': 'application/json'
			}
		});

		console.log(response);

		if (response.ok) {
			vysledek = {
				text: 'Email úspěšně odeslán',
				success: true
			};
		} else {
			vysledek = {
				text: `Email se nepodařilo odeslat: ${response.status} ${response.statusText}`,
				success: false
			};
		}
	};

	$: {
		if (data.uvedeni.jakoMontazka.zaskrtnuto) {
			data.uvedeni.ico = { ...data.montazka.ico, zobrazit: false } as Pisatkova;
			data.uvedeni.zastupce = {
				...data.montazka.zastupce,
				zobrazit: false
			} as Pisatkova;
			data.uvedeni.email = { ...data.montazka.email, zobrazit: false } as Pisatkova;
		} else {
			data.uvedeni.ico.zobrazit = true;
			data.uvedeni.zastupce.zobrazit = true;
			data.uvedeni.email.zobrazit = true;
		}
	}
	$: {
		let jeCTC = ['IR RegulusBOX CTC', 'IR 14 CTC', 'IR 12 CTC'].includes(data.ir.typ.vybrano);
		data.tc.druh.zobrazit = jeCTC;
		data.tc.typ.zobrazit = data.ir.typ.vybrano != '' && (!jeCTC || data.tc.druh.vybrano != '');
		data.tc.cislo.zobrazit = data.ir.typ.vybrano != '';
		data.tc.cislo.regex = jeCTC ? /^\d{4}-\d{4}-\d{4}$/ : /^[A-Z]{2}\d{4}-[A-Z]{2}-\d{4}$/;
		data.tc.cislo.napoveda = jeCTC ? '1234-1234-1234' : 'AB1234-CD-1234';
	}
	$: {
		let jeCTC = ['IR RegulusBOX CTC', 'IR 14 CTC', 'IR 12 CTC'].includes(data.ir.typ.vybrano);
		let moznosti = (function () {
			if (!jeCTC) return ['RTC 6i', 'RTC 12i', 'RTC 13e', 'RTC 20e'];
			if (data.tc.druh.vybrano == 'vzduch/voda')
				return [
					'EcoAir 614M',
					'EcoAir 622M',
					'EcoAir 406',
					'EcoAir 408',
					'EcoAir 410',
					'EcoAir 415',
					'EcoAir 420'
				];
			return [
				'EcoPart 612M',
				'EcoPart 616M',
				'EcoPart 406',
				'EcoPart 408',
				'EcoPart 410',
				'EcoPart 412',
				'EcoPart 414',
				'EcoPart 417',
				'EcoPart 435'
			];
		})();
		data.tc.typ.moznosti = moznosti;
		if (!moznosti.includes(data.tc.typ.vybrano)) {
			data.tc.typ.vybrano = '';
		}
	}
	$: {
		data.vzdalenyPristup.fakturuje.zobrazit = data.vzdalenyPristup.chce.zaskrtnuto;
		data.vzdalenyPristup.fakturuje.nutne = data.vzdalenyPristup.chce.zaskrtnuto;
		data.vzdalenyPristup.pristupMa.zobrazit = data.vzdalenyPristup.chce.zaskrtnuto;
		data.vzdalenyPristup.pristupMa.nutne = data.vzdalenyPristup.chce.zaskrtnuto;
	}
	// $: console.log(data);
</script>

<main class="my-3 container">
	<h1>Evidence regulátorů IR</h1>

	{#each seznam as vec}
		{#if vec === data.montazka.ico && vec.zobrazit}
			<Firma
				id="montazka"
				bind:emailVec={data.montazka.email}
				bind:zastupceVec={data.montazka.zastupce}
				bind:icoVec={data.montazka.ico}
				bind:filtr
				bind:vyfiltrovanyFirmy
			/>
		{/if}
		{#if vec === data.uvedeni.ico && vec.zobrazit}
			<Firma
				id="uvedeni"
				bind:emailVec={data.uvedeni.email}
				bind:zastupceVec={data.uvedeni.zastupce}
				bind:icoVec={data.uvedeni.ico}
				bind:filtr
				bind:vyfiltrovanyFirmy
			/>
		{/if}
		{#if vec instanceof Nadpisova}
			<h2>{vec.nazev}</h2>
		{:else if vec instanceof Pisatkova}
			<p><Pisatko bind:vec /></p>
		{:else if vec instanceof Vybiratkova}
			<p><Vybiratko bind:vec /></p>
		{:else if vec instanceof Radiova}
			<p><Radio bind:vec /></p>
		{:else if vec instanceof MultiZaskrtavatkova}
			<p><MultiZaskrtavatko bind:vec /></p>
		{:else if vec instanceof Zaskrtavatkova}
			<p><Zaskrtavatko bind:vec /></p>
		{/if}
	{/each}

	<div class="d-inline-flex">
		<button id="odeslat" type="button" class="btn btn-primary" on:click={odeslat}> Odeslat </button>
		<p class:text-danger={!vysledek.success} class="ms-3 my-auto">{vysledek.text}</p>
	</div>
</main>

<style>
	#odeslat {
		background-color: #ed2939;
		border-color: #ed2939;
	}
</style>
