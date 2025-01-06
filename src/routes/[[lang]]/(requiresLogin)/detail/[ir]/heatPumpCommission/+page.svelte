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
	import { type Vec } from '$lib/Vec.svelte';
	import VecComponent from '$lib/components/Vec.svelte';
	import type { RawData } from '$lib/Data';
	import { getToken } from '$lib/client/auth';
	import { storable } from '$lib/helpers/stores';
	import FormHeader from '../FormHeader.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	const ir = data.ir;
	const t = data.translations;

	const storedCommission = storable<RawUvedeniTC>(`stored_commission_${ir}`);

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
			`/${data.languageCode}/detail/${data.ir}/pdf/heatPumpCommissionProtocol?token=${token}`
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
	<FormHeader store={storedCommission} {t} title={t.commissioning} />
	{#each list as _, i}
		<VecComponent bind:vec={list[i]} {t} data={d} />
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
