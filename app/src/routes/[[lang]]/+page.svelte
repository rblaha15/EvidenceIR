<script lang="ts">
	// Components
	import Pisatko from '$lib/components/Pisatko.svelte';
	import Vybiratko from '$lib/components/Vybiratko.svelte';
	import Zaskrtavatko from '$lib/components/Zaskrtavatko.svelte';
	import MultiZaskrtavatko from '$lib/components/MultiZaskrtavatko.svelte';
	import Radio from '$lib/components/Radio.svelte';
	import VybiratkoFirmy from '$lib/components/VybiratkoFirmy.svelte';
	import Scanner from '$lib/components/Scanner.svelte';
	import Prihlaseni from '$lib/components/Prihlaseni.svelte';

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
		Textova} from '$lib/Vec';
	import { convertData } from "$lib/Data";
	import { Data } from "$lib/Data";
	import { sprateleneFirmy, prihlasenState, zodpovednaOsoba } from '$lib/firebase';
	import type { Translations } from '$lib/translations';

	// Svelte
	import { dev } from '$app/environment';
	import { page } from '$app/stores';

	// 3rd-party
	import type { User } from 'firebase/auth';
	import DvojVybiratko from '$lib/components/DvojVybiratko.svelte';

	const t = $page.data.translations

	let filtr = '';

	$: montazky = $sprateleneFirmy[0].sort(([a], [b]) => a.localeCompare(b)) ?? [];
	$: uvadeci = $sprateleneFirmy[1].sort(([a], [b]) => a.localeCompare(b)) ?? [];

	$: [vyfiltrovanyMontazky, vyfiltrovanyUvadeci] = [montazky, uvadeci].map((firmy) =>
		firmy.filter(([jmeno]) =>
			filtr
				.normalize('NFD')
				.replace(/\p{Diacritic}/gu, '')
				.toLowerCase()
				.split(' ')
				.every((slovoFiltru) =>
					jmeno
						.normalize('NFD')
						.replace(/\p{Diacritic}/gu, '')
						.toLowerCase()
						.split(' ')
						.some((slovoJmena) => slovoJmena.startsWith(slovoFiltru))
				)
		)
	);

	const data = Data();

	if (dev) {
		// data.ir.typ.vybrano1 = 2;
		// data.ir.typ.vybrano2 = 0;
		// data.ir.cislo.text = 'A9 1234';
		// data.tc.druh.vybrano = 0;
		// data.tc.typ.vybrano = 3;
		// data.tc.cislo.text = '3514-3564-6321';
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

	sprateleneFirmy.subscribe(([montazky, uvadeci]) => {
		if (montazky.length == 1) {
			data.montazka.ico.updateText(montazky[0][1]);
			data.montazka.email.text = montazky[0][2];
			data.montazka.zastupce.text = montazky[0][3];
		}
		if (uvadeci.length == 1) {
			data.uvedeni.ico.updateText(uvadeci[0][1]);
			data.uvedeni.email.text = uvadeci[0][2];
			data.uvedeni.zastupce.text = uvadeci[0][3];
		}
	});

	$: seznam = (Object.values(data) as Data[keyof Data][]).flatMap((obj) => Object.values(obj) as Vec<any>[]);

	let vysledek = {
		text: '',
		success: true
	};

	const odeslat = async () => {
		const { novaEvidence } = await import('$lib/firebase');
		const { poslatEmail, nazevFirmy, sender } = await import('$lib/constants');
		const { htmlToText } = await import('html-to-text');
		const MailPoPotvrzeni = (await import('$lib/mails/MailPoPotvrzeni.svelte')).default;
		const MailSDaty = (await import('$lib/mails/MailSDaty.svelte')).default;

		if (!seznam.every((it) => !it.zpravaJeChybna)) {
			for (let i = 0; i < seznam.length; i++) {
				seznam[i].zobrazitErrorVeto = true;
			}
			return;
		}

		vysledek = {
			success: true,
			text: 'Odesílání...'
		};

		const div = document.createElement('div');
		new MailSDaty({
			target: div,
			props: { data }
		});

		const html = div.innerHTML;
		const text = htmlToText(html);

		const email1 = {
			from: sender,
			to: dev ? 'radek.blaha.15@gmail.com' : 'blahova@regulus.cz',
			subject: `Nově zaevidovaný regulátor ${data.ir.typ.vybrano1} ${data.ir.typ.vybrano2} (${data.ir.cislo.text})`,
			text,
			html
		};

		const id = await novaEvidence(convertData(data));

		if (data.vzdalenyPristup.chce) {
			const montazka = (await nazevFirmy(data.montazka.ico.text)) ?? null;
			const uvadec = (await nazevFirmy(data.uvedeni.ico.text)) ?? null;
			const div = document.createElement('div');
			new MailPoPotvrzeni({
				target: div,
				props: { data, montazka, uvadec }
			});
			const html = div.innerHTML;
			const text = htmlToText(html);
			const response = await poslatEmail({
				from: sender,
				to: dev ? 'radek.blaha.15@gmail.com' : 'blaha@regulus.cz',
				subject: `Nově zaevidovaný regulátor ${data.ir.typ.vybrano1} ${data.ir.typ.vybrano2} (${data.ir.cislo.text})`,
				html,
				text
			});
		}

		const response = await fetch(`/api/poslatEmail`, {
			method: 'POST',
			body: JSON.stringify({ message: email1 }),
			headers: {
				'content-type': 'application/json'
			}
		});

		if (response.ok) {
			vysledek = {
				text: 'Email úspěšně odeslán',
				success: true
			};
			window.location.href = `${$page.url.origin}/detail/?user=${($prihlasenState as User).uid}&id=${id}`;
		} else {
			vysledek = {
				text: `Email se nepodařilo odeslat: ${response.status} ${response.statusText}`,
				success: false
			};
		}
	};

	$: {
		data.zodpovednaOsoba.jmeno.zobrazit = () => $zodpovednaOsoba == null;
		if ($zodpovednaOsoba != null) data.zodpovednaOsoba.jmeno.text = $zodpovednaOsoba;
	}

	$: {
		if (data.uvedeni.jakoMontazka.zaskrtnuto) {
			data.uvedeni.ico.text = data.montazka.ico.text;
			data.uvedeni.zastupce.text = data.montazka.zastupce.text;
			data.uvedeni.email.text = data.montazka.email.text;
		}
	}

	$: {
		if (!data.tc.typ.moznosti({ t, data }).includes(data.tc.typ.value({ t, data }))) {
			data.tc.typ.vybrano = null;
		}
	}

	$: vybranaMontazka = montazky.find(([_, ico]) => ico == data.montazka.ico.text)?.[0] ?? t.unknown_Company;
	$: vybranyUvadec = uvadeci.find(([_, ico]) => ico == data.uvedeni.ico.text)?.[0] ?? t.unknown_Company;
</script>

{#if $prihlasenState == 'null'}
	<div class="spinner-border text-danger m-2" />
{:else}
	<main class="container my-3">
		<div class="d-flex flex-column flex-md-row align-items-start">
			<h1 class="flex-grow-1">{t.longAppName}</h1>

			<Prihlaseni {t} />
		</div>
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
						{t} {data}
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

			<div class="d-inline-flex">
				<button id="odeslat" type="button" class="btn btn-success" on:click={odeslat}>
					{t.send}
				</button>
				<p class:text-danger={!vysledek.success} class="ms-3 my-auto">{vysledek.text}</p>
			</div>
		{:else}
			<p>{t.logInNeeded}</p>
		{/if}
	</main>
{/if}
