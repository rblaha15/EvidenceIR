<script lang="ts">
	// Components
	import Pisatko from '$lib/components/Pisatko.svelte';
	import Vybiratko from '$lib/components/Vybiratko.svelte';
	import Zaskrtavatko from '$lib/components/Zaskrtavatko.svelte';
	import Radio from '$lib/components/Radio.svelte';
	import Mail from '$lib/components/Mail.svelte';
	import Firma from '$lib/components/Firma.svelte';

	// Other
	import { Vec, Typ, type Data } from '$lib/Vec';
	import { seznamFirem } from '$lib/firebase';

	// Svelte
	import { dev } from '$app/environment';
	import { onMount } from 'svelte';

	// 3rd-party
	import { htmlToText } from 'html-to-text';

	let div: HTMLDivElement;

	onMount(() => {
		div = document.createElement('div');
	});

	const probudit = async () => {
		const response = await fetch('https://evidenceitserver.onrender.com/', {
			method: 'GET'
		});
		//console.log(response);
	};
	probudit();

	let filtr = '';

	$: vyfiltrovanyFirmy = $seznamFirem
		.map(({ snapshot }) => snapshot.val() as unknown as string[])
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
			typ: new Vec.Vybiratkova('Typ regulátoru', [
				'IR RegulusBOX CTC',
				'IR RegulusBOX RTC',
				'IR 14 CTC',
				'IR 14 RTC',
				'IR 12 CTC'
			]),
			cislo: new Vec.Pisatkova(
				'Sériové číslo regulátoru',
				'Zadejte číslo ve správném formátu!',
				/([A-Z][1-9OND]) ([0-9]{4})/,
				true,
				'A9 1234'
			)
		},
		tc: {
			druh: new Vec.Radiova(
				'Druh tepelného čerpadla',
				['vzduch/voda', 'země/voda'],
				undefined,
				false
			),
			typ: new Vec.Vybiratkova('Typ tepelného čerpadla', [], undefined, false),
			cislo: new Vec.Pisatkova(
				'Výrobní číslo tepelného čerpadla',
				'Zadejte číslo ve správném formátu',
				undefined,
				false
			)
		},
		koncovyUzivatel: {
			nadpis: new Vec.Nadpisova('Koncový uživatel'),
			jmeno: new Vec.Pisatkova('Jméno'),
			prijmeni: new Vec.Pisatkova('Příjmení'),
			narozeni: new Vec.Pisatkova(
				'Datum narození',
				'Zadejte datum ve správném formátu',
				/^(0?[1-9]|[12][0-9]|3[01]). ?(0?[1-9]|1[0-2]). ?[0-9]{4}$/
			),
			telefon: new Vec.Pisatkova(
				'Telefon',
				'Zadejte telefoní číslo ve správném formátu',
				/^(\+\d{1,3}\s)?\(?\d{3}\)?[\s\.-]?\d{3}[\s\.-]?\d{3,4}$/
			),
			email: new Vec.Pisatkova(
				'Email',
				'Zadejte email ve správném formátu',
				/^[\w\.]+@([\w-]+\.)+[\w-]{2,4}$/
			)
		},
		mistoRealizace: {
			nadpis: new Vec.Nadpisova('Místo realizace'),
			obec: new Vec.Pisatkova('Obec'),
			ulice: new Vec.Pisatkova('Číslo popisné nebo ulice a číslo orientační'),
			psc: new Vec.Pisatkova(
				'Poštovní směrovací číslo',
				'ZAdejte PSČ ve správném formátu',
				/^\d{3} \d{2}$/,
				true,
				'123 45'
			)
		},
		montazka: {
			nadpis: new Vec.Nadpisova('Montážní firma'),
			ico: new Vec.Pisatkova('IČO', 'Zadejte IČO ve správném formátu', /^\d{8}$/, true, '12345678'),
			zastupce: new Vec.Pisatkova('Jméno zástupce'),
			email: new Vec.Pisatkova(
				'Email',
				'Zadejte email ve správném formátu',
				/^[\w\.]+@([\w-]+\.)+[\w-]{2,4}$/
			)
		},
		uvedeni: {
			nadpis: new Vec.Nadpisova('Uvedení do provozu'),
			jakoMontazka: new Vec.Zaskrtavatkova('Do provozu uváděla montážní firma', undefined, false),
			ico: new Vec.Pisatkova('IČO', 'Zadejte IČO ve správném formátu', /^\d{8}$/, true, '12345678'),
			zastupce: new Vec.Pisatkova('Jméno zástupce'),
			email: new Vec.Pisatkova(
				'Email',
				'Zadejte email ve správném formátu',
				/^[\w\.]+@([\w-]+\.)+[\w-]{2,4}$/
			)
		}
	};

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
			//return;
		}

		const message1 = {
			from: '"Webová aplikace evidence IR" aplikace.regulus@centrum.cz',
			to: dev ? 'radek.blaha.15@gmail.com' : 'blahova@regulus.cz',
			subject: `Nově zaevidovaný regulátor ${data.ir.typ.vybrano} (${data.ir.cislo.text})`,
			text: seznam
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
				.join('\n'),
			html: seznam
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
				.join('')
		};

		console.log(message1);

		if (dev) {
			new Mail({
				target: div,
				props: { data }
			});

			const html = div.innerHTML;
			const text = htmlToText(html);

			const message2 = {
				from: '"Webová aplikace evidence IR" aplikace.regulus@centrum.cz',
				to: 'radek.blaha.15@gmail.com',
				subject: `Nově zaevidovaný regulátor ${data.ir.typ.vybrano} (${data.ir.cislo.text})`,
				html,
				text
			};
			console.log(message2);
			const response = await fetch('https://evidenceitserver.onrender.com/poslatEmail', {
				method: 'POST',
				body: JSON.stringify({ message: message2 }),
				headers: {
					'content-type': 'application/json'
				}
			});

			console.log(response);
		}

		const response = await fetch('https://evidenceitserver.onrender.com/poslatEmail', {
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
		if (data.uvedeni.jakoMontazka.bool) {
			data.uvedeni.ico = { ...data.montazka.ico, zobrazit: false } as Vec;
			data.uvedeni.zastupce = {
				...data.montazka.zastupce,
				zobrazit: false
			} as Vec;
			data.uvedeni.email = { ...data.montazka.email, zobrazit: false } as Vec;
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
		data.tc.cislo.vybrano = jeCTC ? '1234-1234-1234' : 'AB1234-CD-1234';
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
		{#if vec.typ == Typ.Nadpis}
			<h2>{vec.nazev}</h2>
		{:else if vec.typ == Typ.Pisatkovy}
			<p><Pisatko bind:vec /></p>
		{:else if vec.typ == Typ.Vybiratkovy}
			<p><Vybiratko bind:vec /></p>
		{:else if vec.typ == Typ.Radiovy}
			<p><Radio bind:vec /></p>
		{:else if vec.typ == Typ.Zaskrtavatkovy}
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
