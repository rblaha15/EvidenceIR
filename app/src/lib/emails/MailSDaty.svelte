<script lang="ts">
	import type { Data } from '$lib/forms/Data';
    import { extractIRIDFromParts } from '$lib/client/firestore'
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
	} from '$lib/Widget.svelte.js';
	import type { User } from 'firebase/auth';

	interface Props {
		data: Data;
		user: User;
		t: Translations;
		origin: string;
	}

	let {
		data,
		user,
		t,
		origin
	}: Props = $props();

    const d = $derived({ d: data })

	let list = $derived((Object.values(data) as Data[keyof Data][]).flatMap(
		(obj) => Object.values(obj) as Widget<{ d: Data }, unknown>[]
	));

    const irid = extractIRIDFromParts(data.ir.typ.value.first!, data.ir.cislo.value)
</script>

<p>Odkaz na podrobnosti evidence: <a href={origin + `/detail/${irid}`}>{origin + `/detail/${irid}`}</a></p>

{#each list as vec}
	{#if vec instanceof TitleWidget && vec.showTextValue(d)}
		<h2>{t.get(vec.label(d))}</h2>
	{:else if vec instanceof TextWidget && vec.showTextValue(d)}
		<p>{t.get(vec.label(d))}</p>
	{:else if vec instanceof InputWidget && vec.showTextValue(d)}
		<p><b>{t.get(vec.label(d))}</b>: {vec.value}</p>
	{:else if vec instanceof DoubleChooserWidget && vec.showTextValue(d)}
		<p><b>{t.get(vec.label(d))}</b>: {t.getN(vec.value.first) ?? ''} {t.getN(vec.value.second) ?? ''}</p>
	{:else if vec instanceof ChooserWidget && vec.showTextValue(d)}
		<p><b>{t.get(vec.label(d))}</b>: {t.getN(vec.value) ?? ''}</p>
	{:else if vec instanceof RadioWidget && vec.showTextValue(d)}
		<p><b>{t.get(vec.label(d))}</b>: {t.getN(vec.value) ?? ''}</p>
	{:else if vec instanceof SwitchWidget && vec.showTextValue(d)}
		<p><b>{t.get(vec.label(d))}</b>: {t.get(vec.value ? vec.options[1] : vec.options[0])}</p>
	{:else if vec instanceof MultiCheckboxWidget && vec.showTextValue(d)}
		<p><b>{t.get(vec.label(d))}</b>: {vec.value.map(s => t.get(s)).join(', ')}</p>
	{:else if vec instanceof CheckboxWidget && vec.showTextValue(d)}
		<p><b>{t.get(vec.label(d))}</b>: {vec.value ? t.yes : t.no}</p>
	{/if}
{/each}
<p><b>Zaevidoval</b>: {user.email}</p>