<script lang="ts">
	import type { Data } from '$lib/Data';
	import type { Translations } from '$lib/translations';
	import {
		DvojVybiratkova,
		MultiZaskrtavatkova,
		Nadpisova,
		Pisatkova,
		Prepinatkova,
		Radiova,
		Textova,
		Vec,
		Vybiratkova,
		Zaskrtavatkova
	} from '$lib/Vec.svelte';
	import type { User } from 'firebase/auth';

	interface Props {
		data: Data;
		user: User;
		t: Translations;
		host: string;
	}

	let {
		data,
		user,
		t,
		host
	}: Props = $props();

	let list = $derived((Object.values(data) as Data[keyof Data][]).flatMap(
		(obj) => Object.values(obj) as Vec<Data, unknown>[]
	));
</script>

<p>Odkaz na podrobnosti evidence: <a href={host + `/detail/${data.ir.cislo.value.replace(' ', '')}`}>{host + `/detail/${data.ir.cislo.value.replace(' ', '')}`}</a></p>

{#each list as vec}
	{#if vec instanceof Nadpisova && vec.showText(data)}
		<h2>{t.get(vec.nazev(data))}</h2>
	{:else if vec instanceof Textova && vec.showText(data)}
		<p>{t.get(vec.nazev(data))}</p>
	{:else if vec instanceof Pisatkova && vec.showText(data)}
		<p><b>{t.get(vec.nazev(data))}</b>: {vec.value}</p>
	{:else if vec instanceof DvojVybiratkova && vec.showText(data)}
		<p><b>{t.get(vec.nazev(data))}</b>: {t.getN(vec.value.first) ?? ''} {t.getN(vec.value.second) ?? ''}</p>
	{:else if vec instanceof Vybiratkova && vec.showText(data)}
		<p><b>{t.get(vec.nazev(data))}</b>: {t.getN(vec.value) ?? ''}</p>
	{:else if vec instanceof Radiova && vec.showText(data)}
		<p><b>{t.get(vec.nazev(data))}</b>: {t.getN(vec.value) ?? ''}</p>
	{:else if vec instanceof Prepinatkova && vec.showText(data)}
		<p><b>{t.get(vec.nazev(data))}</b>: {t.get(vec.value ? vec.moznosti[1] : vec.moznosti[0])}</p>
	{:else if vec instanceof MultiZaskrtavatkova && vec.showText(data)}
		<p><b>{t.get(vec.nazev(data))}</b>: {vec.value.map(s => t.get(s)).join(', ')}</p>
	{:else if vec instanceof Zaskrtavatkova && vec.showText(data)}
		<p><b>{t.get(vec.nazev(data))}</b>: {vec.value ? t.yes : t.no}</p>
	{/if}
{/each}
<p><b>Zaevidoval</b>: {user.email}</p>