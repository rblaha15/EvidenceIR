<script lang="ts">
	import type { Data } from '$lib/forms/Data';
	import type { Translations } from '$lib/translations';
	import {
		DoubleChooserWidget,
		MultiCheckboxWidget,
		TitleWidget,
		InputWidget,
		SwitchWidget,
		RadioWidget,
		TextWidget,
		Widget,
		ChooserWidget,
		CheckboxWidget
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
		(obj) => Object.values(obj) as Widget<Data, unknown>[]
	));
</script>

<p>Odkaz na podrobnosti evidence: <a href={host + `/detail/${data.ir.cislo.value.replace(' ', '')}`}>{host + `/detail/${data.ir.cislo.value.replace(' ', '')}`}</a></p>

{#each list as vec}
	{#if vec instanceof TitleWidget && vec.showTextValue(data)}
		<h2>{t.get(vec.label(data))}</h2>
	{:else if vec instanceof TextWidget && vec.showTextValue(data)}
		<p>{t.get(vec.label(data))}</p>
	{:else if vec instanceof InputWidget && vec.showTextValue(data)}
		<p><b>{t.get(vec.label(data))}</b>: {vec.value}</p>
	{:else if vec instanceof DoubleChooserWidget && vec.showTextValue(data)}
		<p><b>{t.get(vec.label(data))}</b>: {t.getN(vec.value.first) ?? ''} {t.getN(vec.value.second) ?? ''}</p>
	{:else if vec instanceof ChooserWidget && vec.showTextValue(data)}
		<p><b>{t.get(vec.label(data))}</b>: {t.getN(vec.value) ?? ''}</p>
	{:else if vec instanceof RadioWidget && vec.showTextValue(data)}
		<p><b>{t.get(vec.label(data))}</b>: {t.getN(vec.value) ?? ''}</p>
	{:else if vec instanceof SwitchWidget && vec.showTextValue(data)}
		<p><b>{t.get(vec.label(data))}</b>: {t.get(vec.value ? vec.options[1] : vec.options[0])}</p>
	{:else if vec instanceof MultiCheckboxWidget && vec.showTextValue(data)}
		<p><b>{t.get(vec.label(data))}</b>: {vec.value.map(s => t.get(s)).join(', ')}</p>
	{:else if vec instanceof CheckboxWidget && vec.showTextValue(data)}
		<p><b>{t.get(vec.label(data))}</b>: {vec.value ? t.yes : t.no}</p>
	{/if}
{/each}
<p><b>Zaevidoval</b>: {user.email}</p>