<script lang="ts">
	import { evidence as getEvidence, uvestDoProvozu } from '$lib/client/firestore';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import {
		defaultUvedeni,
		rawUvedeniToUvedeni,
		uvedeniToRawUvedeni,
		type RawUvedeni,
		type UD,
		type Uvedeni
	} from '$lib/Uvedeni';
	import {
		DvojVybiratkova,
		MultiZaskrtavatkova,
		Nadpisova,
		Pisatkova,
		Prepinatkova,
		Radiova,
		Textova,
		Vybiratkova,
		Zaskrtavatkova,
		type Vec
	} from '$lib/Vec';
	import {
		Pisatko,
		DvojVybiratko,
		Vybiratko,
		Radio,
		Prepinatko,
		MultiZaskrtavatko,
		Zaskrtavatko
	} from '$lib/components/veci';
	import type { RawData } from '$lib/Data';
	import { getToken } from '$lib/client/auth';
	import { storable } from '$lib/helpers/stores';

	export let data: PageData;
	const ir = data.ir;
	const t = data.translations;

	const storedCommission = storable<RawUvedeni | null>(null, `storedCommission-${ir}`);

	let u: Uvedeni = defaultUvedeni();
	let evidence: RawData;
	onMount(async () => {
		const snapshot = await getEvidence(ir as string);
		console.log(snapshot);
		if (snapshot.exists()) {
			evidence = snapshot.data().evidence;
		}
		const stored = $storedCommission;
		if (stored == null) {
		} else {
			u = rawUvedeniToUvedeni(u, stored);
		}
	});

	let vysledek = {
		text: '',
		red: false,
		load: false
	};

	$: list = (Object.values(u) as Uvedeni[keyof Uvedeni][]).flatMap(
		(obj) => Object.values(obj) as Vec<UD, any>[]
	);
	$: d = { uvedeni: u, evidence } as UD;

	const save = async () => {
		const raw = uvedeniToRawUvedeni(u);
		if (
			list.some((it) => {
				if (it.zpravaJeChybna(d))  console.log(it);
				return it.zpravaJeChybna(d);
			})
		) {
			for (const i in list) {
				list[i].zobrazitErrorVeto = true;
			}
			vysledek = {
				red: true,
				text: t.youHaveAMistake,
				load: false
			};
			return;
		}

		vysledek = { load: true, red: false, text: t.saving };
		await uvestDoProvozu(ir as string, raw);

		storedCommission.set(null);
		vysledek = {
			text: 'Přesměrování...',
			red: false,
			load: true
		};

		const token = await getToken();
		const newWin = window.open(
			`/${data.languageCode}/detail/${data.ir}/pdf/commissionProtocol?token=${token}`
		);
		if (!newWin || newWin.closed) {
			vysledek = {
				text: 'Povolte prosím otevírání oken v prohlížeči',
				red: true,
				load: false
			}	
		}
		else {
			window.location.replace(`/${data.languageCode}/detail/${data.ir}`);
		}
	};

	$: if (evidence) {
		storedCommission.set(uvedeniToRawUvedeni(u));
	}
</script>

{#if evidence}
	<h1>{t.commissioning}</h1>
	{#each list as vec}
		{#if vec instanceof Nadpisova && vec.zobrazit(d)}
			<h2>{t.get(vec.nazev(d))}</h2>
		{:else if vec instanceof Textova && vec.zobrazit(d)}
			<p>{t.get(vec.nazev(d))}</p>
		{:else if vec instanceof Pisatkova && vec.zobrazit(d)}
			<p><Pisatko bind:vec {t} data={d} /></p>
		{:else if vec instanceof DvojVybiratkova && vec.zobrazit(d)}
			<p><DvojVybiratko bind:vec {t} data={d} /></p>
		{:else if vec instanceof Vybiratkova && vec.zobrazit(d)}
			<p><Vybiratko bind:vec {t} data={d} /></p>
		{:else if vec instanceof Radiova && vec.zobrazit(d)}
			<p><Radio bind:vec {t} data={d} /></p>
		{:else if vec instanceof Prepinatkova && vec.zobrazit(d)}
			<p><Prepinatko bind:vec {t} data={d} /></p>
		{:else if vec instanceof MultiZaskrtavatkova && vec.zobrazit(d)}
			<p><MultiZaskrtavatko {t} bind:vec data={d} /></p>
		{:else if vec instanceof Zaskrtavatkova && vec.zobrazit(d)}
			<p><Zaskrtavatko {t} bind:vec data={d} /></p>
		{/if}
	{/each}
	<div class="d-inline-flex align-content-center">
		{#if !vysledek.load}
			<button on:click={save} class="btn btn-success">{t.save}</button>
		{/if}
		{#if vysledek.load}
			<div class="spinner-border text-danger ms-2" />
		{/if}
		<p class:text-danger={vysledek.red} class="ms-2 my-auto">{@html vysledek.text}</p>
	</div>
{:else}
	<div class="spinner-border text-danger m-2" />
{/if}
