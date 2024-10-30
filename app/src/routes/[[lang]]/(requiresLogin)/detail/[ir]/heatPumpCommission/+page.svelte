<script lang="ts">
	import { evidence as getEvidence, uvestTCDoProvozu } from '$lib/client/firestore';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import {
		defaultUvedeniTC,
		rawUvedeniTCToUvedeniTC,
		uvedeniTCToRawUvedeniTC,
		type RawUvedeniTC,
		type UDTC,
		type UvedeniTC
	} from '$lib/UvedeniTC';
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
	} from '$lib/Vec.svelte';
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
	import { storableOrUndefined } from '$lib/helpers/stores';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	const ir = data.ir;
	const t = data.translations;

	const storedCommission = storableOrUndefined<RawUvedeniTC>(`stored_commission_${ir}`);

	let u: UvedeniTC = $state(defaultUvedeniTC());
	let evidence = $state() as RawData;
	onMount(async () => {
		const snapshot = await getEvidence(ir as string);
		if (snapshot.exists()) {
			evidence = snapshot.data().evidence;
		}
		const stored = $storedCommission;
		if (stored == null) {
		} else {
			u = rawUvedeniTCToUvedeniTC(u, stored);
		}
	});

	let vysledek = $state({
		text: '',
		red: false,
		load: false
	});

	let list = $derived((Object.values(u) as UvedeniTC[keyof UvedeniTC][]).flatMap(
		(obj) => Object.values(obj) as Vec<UDTC, any>[]
	));
	let d = $derived({ uvedeni: u, evidence } as UDTC);

	const save = async () => {
		const raw = uvedeniTCToRawUvedeniTC(u);
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
		await uvestTCDoProvozu(ir as string, raw);

		storedCommission.set(undefined);
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

	$effect(() => {
		if (evidence) {
			storedCommission.set(uvedeniTCToRawUvedeniTC(u));
		}
	});
</script>

{#if evidence}
	<h1>{t.commissioning}</h1>
	{#each list as vec, i}
		{#if vec instanceof Nadpisova && vec.zobrazit(d)}
			<h2>{t.get(vec.nazev(d))}</h2>
		{:else if vec instanceof Textova && vec.zobrazit(d)}
			<p>{t.get(vec.nazev(d))}</p>
		{:else if vec instanceof Pisatkova && vec.zobrazit(d)}
			<p><Pisatko bind:vec={list[i] as Pisatkova<UDTC>} {t} data={d} /></p>
		{:else if vec instanceof DvojVybiratkova && vec.zobrazit(d)}
			<p><DvojVybiratko bind:vec={list[i] as DvojVybiratkova<UDTC>} {t} data={d} /></p>
		{:else if vec instanceof Vybiratkova && vec.zobrazit(d)}
			<p><Vybiratko bind:vec={list[i] as Vybiratkova<UDTC>} {t} data={d} /></p>
		{:else if vec instanceof Radiova && vec.zobrazit(d)}
			<p><Radio bind:vec={list[i] as Radiova<UDTC>} {t} data={d} /></p>
		{:else if vec instanceof Prepinatkova && vec.zobrazit(d)}
			<p><Prepinatko bind:vec={list[i] as Prepinatkova<UDTC>} {t} data={d} /></p>
		{:else if vec instanceof MultiZaskrtavatkova && vec.zobrazit(d)}
			<p><MultiZaskrtavatko {t} bind:vec={list[i] as MultiZaskrtavatkova<UDTC>} data={d} /></p>
		{:else if vec instanceof Zaskrtavatkova && vec.zobrazit(d)}
			<p><Zaskrtavatko {t} bind:vec={list[i] as Zaskrtavatkova<UDTC>} data={d} /></p>
		{/if}
	{/each}
	<div class="d-inline-flex align-content-center">
		{#if !vysledek.load}
			<button onclick={save} class="btn btn-success">{t.save}</button>
		{/if}
		{#if vysledek.load}
			<div class="spinner-border text-danger ms-2"></div>
		{/if}
		<button type="button" class="btn btn-outline-secondary ms-2" onclick={() => history.back()}>
			{t.back}
		</button>
		<p class:text-danger={vysledek.red} class="ms-2 my-auto">{@html vysledek.text}</p>
	</div>
{:else}
	<div class="spinner-border text-danger m-2"></div>
{/if}
