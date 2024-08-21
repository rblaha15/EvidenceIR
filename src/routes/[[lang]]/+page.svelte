<script lang="ts">
	// Components
	import Pisatko from '$lib/components/Pisatko.svelte';
	import Vybiratko from '$lib/components/Vybiratko.svelte';
	import Zaskrtavatko from '$lib/components/Zaskrtavatko.svelte';
	import MultiZaskrtavatko from '$lib/components/MultiZaskrtavatko.svelte';
	import Radio from '$lib/components/Radio.svelte';
	import VybiratkoFirmy from '$lib/components/VybiratkoFirmy.svelte';
	import Scanner from '$lib/components/Scanner.svelte';
	import Navigation from '$lib/components/Navigation.svelte';

	// Other
	import {
		Vybiratkova,
		Pisatkova,
		Radiova,
		Nadpisova,
		Zaskrtavatkova,
		MultiZaskrtavatkova,
		Vec,
		DvojVybiratkova,
		Textova
	} from '$lib/Vec';
	import { convertData } from '$lib/Data';
	import { Data } from '$lib/Data';
	import { prihlasenState } from '$lib/client/auth';
	import { sprateleneFirmy, zodpovednaOsoba } from '$lib/client/realtime';
	// Svelte
	import { dev } from '$app/environment';
	import { page } from '$app/stores';

	// 3rd-party
	import DvojVybiratko from '$lib/components/DvojVybiratko.svelte';
	import { relUrl } from '$lib/constants';
	import { onMount } from 'svelte';

	const t = $page.data.translations;

	let filtr = '';

	$: montazky = $sprateleneFirmy.assemblyCompanies ?? [];
	// $: montazky = montazky1.sort((a, b) => a.companyName.localeCompare(b.companyName)) ?? [];
	$: uvadeci = $sprateleneFirmy.commissioningCompanies ?? [];
	// $: uvadeci = uvadeci1.sort((a, b) => a.companyName.localeCompare(b.companyName)) ?? [];

	$: [vyfiltrovanyMontazky, vyfiltrovanyUvadeci] = [montazky, uvadeci].map((firmy) =>
		firmy.filter(({ companyName }) =>
			filtr
				.normalize('NFD')
				.replace(/\p{Diacritic}/gu, '')
				.toLowerCase()
				.split(' ')
				.every((slovoFiltru) =>
					companyName
						.normalize('NFD')
						.replace(/\p{Diacritic}/gu, '')
						.toLowerCase()
						.split(' ')
						.some((slovoJmena) => slovoJmena.startsWith(slovoFiltru))
				)
		)
	);

	let nacita = true;
	onMount(() => (nacita = false));

	const data = Data();

	if (dev) {
		data.ir.typ.vybrano1 = 2;
		data.ir.typ.vybrano2 = 0;
		data.ir.cislo.text = 'A9 1234';
		data.ir.cisloBOX.text = '2167853-2465453';
		data.ir.chceVyplnitK.vybrano = [0];
		data.tc.druh.vybrano = 0;
		data.tc.typ.vybrano = 3;
		data.tc.cislo.text = '3514-3564-6321';
		data.koncovyUzivatel.jmeno.text = 'Radek';
		data.koncovyUzivatel.prijmeni.text = 'Bláha';
		data.koncovyUzivatel.narozeni.text = '15. 3. 2007';
		data.koncovyUzivatel.telefon.text = '+420 792 313 555';
		data.koncovyUzivatel.email.text = 'radek.blaha.15@gmail.com';
		data.bydliste.obec.text = 'České Budějovice';
		data.bydliste.ulice.text = 'Josefa Hory 18';
		data.bydliste.psc.text = '370 06';
		data.mistoRealizace.obec.text = 'České Budějovice';
		data.mistoRealizace.psc.text = '370 06';
		data.vzdalenyPristup.chce.zaskrtnuto = true;
	}

	sprateleneFirmy.subscribe(({ assemblyCompanies, commissioningCompanies }) => {
		if (assemblyCompanies.length == 1) {
			data.montazka.ico.updateText(assemblyCompanies[0].crn);
			data.montazka.email.text = assemblyCompanies[0].email ?? '';
			data.montazka.zastupce.text = assemblyCompanies[0].representative ?? '';
		}
		if (commissioningCompanies.length == 1) {
			data.uvedeni.ico.updateText(commissioningCompanies[0].crn);
			data.uvedeni.email.text = commissioningCompanies[0].email ?? '';
			data.uvedeni.zastupce.text = commissioningCompanies[0].representative ?? '';
		}
	});

	$: seznam = (Object.values(data) as Data[keyof Data][]).flatMap(
		(obj) => Object.values(obj) as Vec<any>[]
	);

	let vysledek = {
		text: '',
		red: false,
		load: false
	};
	let doNotSend = false;

	const odeslat = async function () {
		const { novaEvidence } = await import('$lib/client/firestore');
		const { poslatEmail, nazevFirmy, sender } = await import('$lib/constants');
		const { htmlToText } = await import('html-to-text');
		const MailRRoute = (await import('$lib/emails/MailRRoute.svelte')).default;
		const MailSDaty = (await import('$lib/emails/MailSDaty.svelte')).default;

		if (seznam.some((it) => it.zpravaJeChybna({ t, data }))) {
			for (let i = 0; i < seznam.length; i++) {
				seznam[i].zobrazitErrorVeto = true;
			}
			vysledek = {
				red: true,
				text: t.youHaveAMistake,
				load: false
			};
			return;
		}

		vysledek = {
			red: false,
			text: t.saving,
			load: true
		};

		if (data.uvedeni.jakoMontazka.zaskrtnuto) {
			data.uvedeni.ico.updateText(data.montazka.ico.text);
			data.uvedeni.zastupce.text = data.montazka.zastupce.text;
			data.uvedeni.email.text = data.montazka.email.text;
		}

		const rawData = convertData({ t, data, lang: $page.data.languageCode });

		const div = document.createElement('div');
		new MailSDaty({
			target: div,
			props: { data: rawData }
		});

		const html = div.innerHTML;
		const text = htmlToText(html);

		const email1 = {
			from: sender,
			to: dev ? 'radek.blaha.15@gmail.com' : 'blahova@regulus.cz',
			subject: `Nově zaevidovaný regulátor ${rawData.ir.typ.first} ${rawData.ir.typ.second} (${rawData.ir.cislo})`,
			text,
			html
		};

		const id = await novaEvidence({ evidence: rawData, kontroly: {} });

		if (rawData.vzdalenyPristup.chce) {
			const montazka = (await nazevFirmy(rawData.montazka.ico)) ?? null;
			const uvadec = (await nazevFirmy(rawData.uvedeni.ico)) ?? null;
			const div = document.createElement('div');
			new MailRRoute({
				target: div,
				props: { data: rawData, montazka, uvadec }
			});
			const html = div.innerHTML;
			const text = htmlToText(html);
			if (!doNotSend)
				await poslatEmail({
					from: sender,
					to: dev ? 'radek.blaha.15@gmail.com' : 'blahova@regulus.cz',
					subject: `Nově zaevidovaný regulátor ${rawData.ir.typ.first} ${rawData.ir.typ.second} (${rawData.ir.cislo})`,
					html,
					text
				});
		}

		const response = doNotSend ? undefined : await poslatEmail(email1);

		if (doNotSend || response!.ok) {
			vysledek = {
				text: 'Přesměrování...',
				red: false,
				load: true
			};
			const id = rawData.ir.cislo.replace(' ', '');
			window.location.href = $relUrl(`/detail/${id}`);
			setTimeout(() => {
				vysledek = {
					text: `Přesměrování se nezdařilo. Prosím, přejděte na tuto adresu: <a href="${$relUrl(`/detail/${id}`)}">${$page.url.origin}${$relUrl(`/detail/${rawData.ir.cislo}`)}</a>`,
					red: true,
					load: false
				};
			}, 1000);
		} else {
			vysledek = {
				text: `Email se nepodařilo odeslat: ${response!.status} ${response!.statusText}`,
				red: true,
				load: false
			};
		}
	};

	$: {
		data.ostatni.zodpovednaOsoba.zobrazit = () => $zodpovednaOsoba == null;
		if ($zodpovednaOsoba != null) data.ostatni.zodpovednaOsoba.text = $zodpovednaOsoba;
	}

	$: {
		if (data.uvedeni.jakoMontazka.zaskrtnuto) {
			data.uvedeni.ico.updateText('');
			data.uvedeni.zastupce.text = '';
			data.uvedeni.email.text = '';
		} else if (
			data.uvedeni.ico.text == data.montazka.ico.text &&
			data.uvedeni.ico.text != '' &&
			data.uvedeni.zastupce.text == data.montazka.zastupce.text &&
			data.uvedeni.zastupce.text != '' &&
			data.uvedeni.email.text == data.montazka.email.text &&
			data.uvedeni.email.text != ''
		) {
			data.uvedeni.jakoMontazka.zaskrtnuto = true;
			data.uvedeni.ico.updateText(''); // data.montazka.ico.text;
			data.uvedeni.zastupce.text = ''; // data.montazka.zastupce.text;
			data.uvedeni.email.text = ''; // data.montazka.email.text;
		}
	}

	$: {
		if (!data.tc.typ.moznosti({ t, data }).includes(data.tc.typ.value({ t, data }))) {
			data.tc.typ.vybrano = null;
		}
	}

	$: vybranaMontazka =
		montazky.find((c) => c.crn == data.montazka.ico.text)?.companyName ?? t.unknown_Company;
	$: vybranyUvadec =
		uvadeci.find((c) => c.crn == data.uvedeni.ico.text)?.companyName ?? t.unknown_Company;
</script>

{#if $prihlasenState == 'null' || nacita}
	<div class="spinner-border text-danger m-2" />
{:else}
	<Navigation {t} />
	<main class="container my-3">
		{#if $prihlasenState}
			<hr class="d-md-none" />
			{#each seznam as vec}
				{#if vec === data.montazka.ico && vec.zobrazit({ t, data })}
					<p>{t.chosenCompany}: {vybranaMontazka}</p>
					{#if montazky.length > 1}
						<VybiratkoFirmy
							id="montazka"
							bind:emailVec={data.montazka.email}
							bind:zastupceVec={data.montazka.zastupce}
							bind:icoVec={data.montazka.ico}
							bind:filtr
							bind:vyfiltrovanyFirmy={vyfiltrovanyMontazky}
							{t}
						/>
					{/if}
				{/if}
				{#if vec === data.uvedeni.ico && vec.zobrazit({ t, data })}
					<p>{t.chosenCompany}: {vybranyUvadec}</p>
					{#if uvadeci.length > 1}
						<VybiratkoFirmy
							id="uvedeni"
							bind:emailVec={data.uvedeni.email}
							bind:zastupceVec={data.uvedeni.zastupce}
							bind:icoVec={data.uvedeni.ico}
							bind:filtr
							bind:vyfiltrovanyFirmy={vyfiltrovanyUvadeci}
							{t}
						/>
					{/if}
				{/if}
				{#if vec === data.tc.cislo && vec.zobrazit({ t, data })}
					<Scanner
						bind:vec={data.tc.cislo}
						zobrazit={data.ir.typ.vybrano2 == 0}
						onScan={(text) => (data.tc.cislo.text = text.slice(8))}
						{t}
						{data}
					/>
				{:else if vec instanceof Nadpisova && vec.zobrazit({ t, data })}
					<h2>{vec.nazev({ t, data })}</h2>
				{:else if vec instanceof Textova && vec.zobrazit({ t, data })}
					<p>{vec.nazev({ t, data })}</p>
				{:else if vec instanceof Pisatkova && vec.zobrazit({ t, data })}
					<p><Pisatko bind:vec {t} {data} /></p>
				{:else if vec instanceof DvojVybiratkova && vec.zobrazit({ t, data })}
					<p><DvojVybiratko bind:vec {t} {data} /></p>
				{:else if vec instanceof Vybiratkova && vec.zobrazit({ t, data })}
					<p><Vybiratko bind:vec {t} {data} /></p>
				{:else if vec instanceof Radiova && vec.zobrazit({ t, data })}
					<p><Radio bind:vec {t} {data} /></p>
				{:else if vec instanceof MultiZaskrtavatkova && vec.zobrazit({ t, data })}
					<p><MultiZaskrtavatko bind:vec {t} {data} /></p>
				{:else if vec instanceof Zaskrtavatkova && vec.zobrazit({ t, data })}
					<p><Zaskrtavatko bind:vec {t} {data} /></p>
				{/if}
			{/each}

			{#if dev}
				<div class="form-check">
					<p>
						<label class="form-check-label">
							<input class="form-check-input" type="checkbox" bind:checked={doNotSend} />
							Neodesílat emaily
						</label>
					</p>
				</div>
			{/if}

			<div class="d-inline-flex">
				<button id="odeslat" type="button" class="btn btn-success" on:click={odeslat}>
					{t.save}
				</button>

				{#if vysledek.load}
					<div class="spinner-border text-danger ms-2" />
				{/if}
				<p class:text-danger={vysledek.red} class="ms-2 my-auto">{@html vysledek.text}</p>
			</div>
		{:else}
			<p>{t.logInNeeded}</p>
		{/if}
	</main>
{/if}
