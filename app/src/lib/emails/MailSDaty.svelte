<script lang="ts">
    import type { Data, UDDA } from '$lib/forms/Data';
    import { extractIRIDFromParts } from '$lib/client/firestore';
    import type { Translations } from '$lib/translations';
    import {
        CheckboxWidget,
        ChooserWidget,
        DoubleChooserWidget,
        InputWidget,
        MultiCheckboxWidget,
        RadioWidget,
        SwitchWidget,
        TextWidget,
        TitleWidget
    } from '$lib/Widget.svelte.js';
    import type { User } from 'firebase/auth';
    import type { Form } from '$lib/forms/Form';

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

    const d = $derived({ d: data });

    let list = $derived((data as Form<UDDA>).getValues().flatMap(obj => obj.getValues()));

    const irid = extractIRIDFromParts(data.ir.typ.value.first!, data.ir.cislo.value);
</script>

<p>Odkaz na podrobnosti evidence: <a href={origin + `/detail/${irid}`}>{origin + `/detail/${irid}`}</a></p>

{#each list as vec}
    {#if vec instanceof TitleWidget && vec.showTextValue(d)}
        {#await vec.text(d, t) then text}<h2>{t.get(text)}</h2>{/await}
    {:else if vec instanceof TextWidget && vec.showTextValue(d)}
        {#await vec.text(d, t) then text}<p>{t.get(text)}</p>{/await}
    {:else if vec instanceof InputWidget && vec.showTextValue(d)}
        <p><b>{t.get(vec.label(d, t))}</b>: {vec.value}</p>
    {:else if vec instanceof DoubleChooserWidget && vec.showTextValue(d)}
        <p><b>{t.get(vec.label(d, t))}</b>: {t.get(vec.value.first) ?? ''} {t.get(vec.value.second) ?? ''}</p>
    {:else if vec instanceof ChooserWidget && vec.showTextValue(d)}
        <p><b>{t.get(vec.label(d, t))}</b>: {t.get(vec.value) ?? ''}</p>
    {:else if vec instanceof RadioWidget && vec.showTextValue(d)}
        <p><b>{t.get(vec.label(d, t))}</b>: {t.get(vec.value) ?? ''}</p>
    {:else if vec instanceof SwitchWidget && vec.showTextValue(d)}
        <p><b>{t.get(vec.label(d, t))}</b>: {t.get(vec.value ? vec.options[1] : vec.options[0])}</p>
    {:else if vec instanceof MultiCheckboxWidget && vec.showTextValue(d)}
        <p><b>{t.get(vec.label(d, t))}</b>: {vec.value.map(s => t.get(s)).join(', ')}</p>
    {:else if vec instanceof CheckboxWidget && vec.showTextValue(d)}
        <p><b>{t.get(vec.label(d, t))}</b>: {vec.value ? t.yes : t.no}</p>
    {/if}
{/each}
<p><b>Zaevidoval</b>: {user.email}</p>