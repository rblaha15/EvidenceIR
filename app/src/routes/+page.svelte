<script lang="ts">
	// Components
	import Pisatko from '$lib/components/Pisatko.svelte';
	import Vybiratko from '$lib/components/Vybiratko.svelte';
	import Zaskrtavatko from '$lib/components/Zaskrtavatko.svelte';
	import MultiZaskrtavatko from '$lib/components/MultiZaskrtavatko.svelte';
	import Radio from '$lib/components/Radio.svelte';
	import VybiratkoFirmy from '$lib/components/VybiratkoFirmy.svelte';

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
	import { sprateleneFirmy, type Firma, prihlasenState, zodpovednaOsoba } from '$lib/firebase';

	// Svelte
	import { dev } from '$app/environment';
	import { page } from '$app/stores';

	// 3rd-party
	import Scanner from '$lib/components/Scanner.svelte';
	import Prihlaseni from '$lib/components/Prihlaseni.svelte';

	let filtr = '';

	$: montazky = $sprateleneFirmy[0] ?? [];
	$: uvadeci = $sprateleneFirmy[1] ?? [];

	$: console.log($prihlasenState)

	$: [vyfiltrovanyMontazky, vyfiltrovanyUvadeci] = $sprateleneFirmy.map((firmy) =>
		firmy
			.map(([jmeno, ico, email, zastupce]) => [jmeno.normalize(), ico, email, zastupce] as Firma)
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
			)
	);

	const data: Data = {
		ir: {
			typ: new Vybiratkova('Typ regulátoru', [
				'IR RegulusBOX CTC',
				'IR RegulusBOX RTC',
				'IR RegulusHBOX CTC',
				'IR RegulusHBOX RTC',
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

	$: if (montazky.length == 1) {
		data.montazka.ico.text = montazky[0][1];
		data.montazka.email.text = montazky[0][2];
		data.montazka.zastupce.text = montazky[0][3];
	}
	$: if (uvadeci.length == 1) {
		data.uvedeni.ico.text = uvadeci[0][1];
		data.uvedeni.email.text = uvadeci[0][2];
		data.uvedeni.zastupce.text = uvadeci[0][3];
	}

	$: seznam = (Object.values(data) as Object[]).flatMap((obj) => Object.values(obj) as Vec[]);

	let vysledek = {
		text: '',
		success: true
	};

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

	const odeslat = async () => {
		const { poslatEmail, sender } = await import('$lib/constants');
		const { htmlToText } = await import('html-to-text');
		const MailPoPotvrzeni = (await import('$lib/mails/MailPoPotvrzeni.svelte')).default;
		const MailSDaty = (await import('$lib/mails/MailSDaty.svelte')).default;

		if (!seznam.every((it) => !it.zpravaJeChybna)) {
			for (let i = 0; i < seznam.length; i++) {
				seznam[i].zobrazitErrorVeto = true;
			}
			return;
		}

		const div = document.createElement('div');
		new MailSDaty({
			target: div,
			props: { data }
		});

		const html = div.innerHTML;
		const text = htmlToText(html);

		const message1 = {
			from: sender,
			to: dev ? 'radek.blaha.15@gmail.com' : 'blahova@regulus.cz',
			subject: `Nově zaevidovaný regulátor ${data.ir.typ.vybrano} (${data.ir.cislo.text})`,
			text,
			html
		};

		console.log(message1);

		if (data.vzdalenyPristup.chce) {
			const montazka = (await nazevFirmy(fireData.montazka.ico.text)) ?? null;
			const uvadec = (await nazevFirmy(fireData.uvedeni.ico.text)) ?? null;
			const div = document.createElement('div');
			new MailPoPotvrzeni({
				target: div,
				props: { data, montazka, uvadec, osoba: $zodpovednaOsoba }
			});
			const html = div.innerHTML;
			const text = htmlToText(html);
			const response = await poslatEmail({
				from: sender,
				to: dev ? 'radek.blaha.15@gmail.com' : 'blaha@regulus.cz',
				subject: `Nově zaevidovaný regulátor ${fireData.ir.typ.vybrano} (${fireData.ir.cislo.text})`,
				html,
				text,
			});

			console.log(response);
		}

		const response = await fetch(`/api/poslatEmail`, {
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
			data.uvedeni.ico = data.montazka.ico.copy();
			data.uvedeni.zastupce = data.montazka.zastupce.copy();
			data.uvedeni.email = data.montazka.email.copy();
		}
		data.uvedeni.ico.zobrazit = !data.uvedeni.jakoMontazka.zaskrtnuto;
		data.uvedeni.zastupce.zobrazit = !data.uvedeni.jakoMontazka.zaskrtnuto;
		data.uvedeni.email.zobrazit = !data.uvedeni.jakoMontazka.zaskrtnuto;
	}

	$: {
		let jeCTC = ['IR RegulusBOX CTC', 'IR 14 CTC', 'IR 12 CTC'].includes(data.ir.typ.vybrano);

		data.tc.druh.zobrazit = jeCTC;
		data.tc.typ.zobrazit = data.ir.typ.vybrano != '' && (!jeCTC || data.tc.druh.vybrano != '');
		data.tc.cislo.zobrazit = data.ir.typ.vybrano != '';
		data.tc.cislo.regex = jeCTC ? /^\d{4}-\d{4}-\d{4}$/ : /^[A-Z]{2}\d{4}-[A-Z]{2}-\d{4}$/;
		data.tc.cislo.napoveda = jeCTC ? '1234-1234-1234' : 'AB1234-CD-1234';

		let moznosti = (function () {
			if (!jeCTC) return ['RTC 6i', 'RTC 13e', 'RTC 20e'];
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
	<div class="d-sm-flex flex-sm-row">
		<h1 class="flex-grow-1">Evidence regulátorů IR</h1>

		<Prihlaseni />
	</div>
	{#if $prihlasenState}
		{#each seznam as vec}
			{#if vec === data.montazka.ico && vec.zobrazit && montazky.length > 1}
				<VybiratkoFirmy
					id="montazka"
					bind:emailVec={data.montazka.email}
					bind:zastupceVec={data.montazka.zastupce}
					bind:icoVec={data.montazka.ico}
					bind:filtr
					bind:vyfiltrovanyFirmy={vyfiltrovanyMontazky}
				/>
			{/if}
			{#if vec === data.uvedeni.ico && vec.zobrazit && uvadeci.length > 1}
				<VybiratkoFirmy
					id="uvedeni"
					bind:emailVec={data.uvedeni.email}
					bind:zastupceVec={data.uvedeni.zastupce}
					bind:icoVec={data.uvedeni.ico}
					bind:filtr
					bind:vyfiltrovanyFirmy={vyfiltrovanyUvadeci}
				/>
			{/if}
			{#if vec === data.tc.cislo && vec.zobrazit}
				<Scanner
					bind:vec={data.tc.cislo}
					zobrazit={data.ir.typ.vybrano.includes('CTC')}
					onScan={(text) => (data.tc.cislo.text = text.slice(8))}
				/>
			{:else if vec instanceof Nadpisova && vec.zobrazit}
				<h2>{vec.nazev}</h2>
			{:else if vec instanceof Pisatkova && vec.zobrazit}
				<p><Pisatko bind:vec /></p>
			{:else if vec instanceof Vybiratkova && vec.zobrazit}
				<p><Vybiratko bind:vec /></p>
			{:else if vec instanceof Radiova && vec.zobrazit}
				<p><Radio bind:vec /></p>
			{:else if vec instanceof MultiZaskrtavatkova && vec.zobrazit}
				<p><MultiZaskrtavatko bind:vec /></p>
			{:else if vec instanceof Zaskrtavatkova && vec.zobrazit}
				<p><Zaskrtavatko bind:vec /></p>
			{/if}
		{/each}

		<div class="d-inline-flex">
			<button id="odeslat" type="button" class="btn btn-primary" on:click={odeslat}> Odeslat </button>
			<p class:text-danger={!vysledek.success} class="ms-3 my-auto">{vysledek.text}</p>
		</div>
	{:else}
		<p>Pro zobrazení a vyplnění formuláře je nutné se přihlásit!</p>
	{/if}
</main>

<style>
	#odeslat {
		background-color: #5dabc8;
		border-color: #5dabc8;
		color: #000000;
	}
</style>
