<script lang="ts">
	import type { Data, RawData } from '$lib/Data';
	import type { Translations } from '$lib/translations';
	import {
		DvojVybiratkova,
		MultiZaskrtavatkova,
		Nadpisova,
		p,
		Pisatkova,
		Prepinatkova,
		Radiova,
		Textova,
		Vec,
		Vybiratkova,
		Zaskrtavatkova
	} from '$lib/Vec';
	import type { User } from 'firebase/auth';

	export let data: Data;
	export let user: User;
	export let t: Translations;

	$: list = (Object.values(data) as Data[keyof Data][]).flatMap(
		(obj) => Object.values(obj) as Vec<Data, any>[]
	);
</script>

{#each list as vec}
	{#if vec instanceof Nadpisova && vec.zobrazit(data)}
		<h2>{t.get(vec.nazev(data))}</h2>
	{:else if vec instanceof Textova && vec.zobrazit(data)}
		<p>{t.get(vec.nazev(data))}</p>
	{:else if vec instanceof Pisatkova && vec.zobrazit(data)}
		<p><b>{t.get(vec.nazev(data))}</b>: {vec.value}</p>
	{:else if vec instanceof DvojVybiratkova && vec.zobrazit(data)}
		<p><b>{t.get(vec.nazev(data))}</b>: {t.getN(vec.value.first) ?? ''} {t.getN(vec.value.second) ?? ''}</p>
	{:else if vec instanceof Vybiratkova && vec.zobrazit(data)}
		<p><b>{t.get(vec.nazev(data))}</b>: {t.getN(vec.value) ?? ''}</p>
	{:else if vec instanceof Radiova && vec.zobrazit(data)}
		<p><b>{t.get(vec.nazev(data))}</b>: {t.getN(vec.value) ?? ''}</p>
	{:else if vec instanceof Prepinatkova && vec.zobrazit(data)}
		<p><b>{t.get(vec.nazev(data))}</b>: {vec.value ? vec.moznosti[0] : vec.moznosti[1]}</p>
	{:else if vec instanceof MultiZaskrtavatkova && vec.zobrazit(data)}
		<p><b>{t.get(vec.nazev(data))}</b>: {vec.value.map(s => t.get(s)).join(', ')}</p>
	{:else if vec instanceof Zaskrtavatkova && vec.zobrazit(data)}
		<p><b>{t.get(vec.nazev(data))}</b>: {vec.value ? 'ano' : 'ne'}</p>
	{/if}
{/each}
<p><b>Zaevidoval</b>: {user.email}</p>