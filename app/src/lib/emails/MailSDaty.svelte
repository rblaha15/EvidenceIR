<script lang="ts">
    import type { FormIN } from '$lib/forms/IN/formIN';
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
    } from '$lib/forms/Widget.svelte.js';
    import type { User } from 'firebase/auth';
    import type { Form } from '$lib/forms/Form';
    import { extractIRIDFromParts } from '$lib/helpers/ir';
    import { detailIrUrl } from '$lib/helpers/runes.svelte';

    interface Props {
        data: FormIN;
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

    let list = $derived((data as Form<FormIN>).getValues().flatMap(obj => obj.getValues()));

    const irid = extractIRIDFromParts(data.ir.typ.value.first!, data.ir.cislo.value);
</script>

<p>Odkaz na podrobnosti evidence: <a href={origin + detailIrUrl(irid)}>{origin + detailIrUrl(irid)}</a></p>

{#each list as vec}
    {#if vec instanceof TitleWidget && vec.showTextValue(data)}
        {#await vec.text(data, t) then text}<h2>{t.get(text)}</h2>{/await}
    {:else if vec instanceof TextWidget && vec.showTextValue(data)}
        {#await vec.text(data, t) then text}<p>{t.get(text)}</p>{/await}
    {:else if vec instanceof InputWidget && vec.showTextValue(data)}
        <p><b>{t.get(vec.label(data, t))}</b>: {vec.value}</p>
    {:else if vec instanceof DoubleChooserWidget && vec.showTextValue(data)}
        <p><b>{t.get(vec.label(data, t))}</b>: {t.get(vec.value.first) ?? ''} {t.get(vec.value.second) ?? ''}</p>
    {:else if vec instanceof ChooserWidget && vec.showTextValue(data)}
        <p><b>{t.get(vec.label(data, t))}</b>: {t.get(vec.value) ?? ''}</p>
    {:else if vec instanceof RadioWidget && vec.showTextValue(data)}
        <p><b>{t.get(vec.label(data, t))}</b>: {t.get(vec.value) ?? ''}</p>
    {:else if vec instanceof SwitchWidget && vec.showTextValue(data)}
        <p><b>{t.get(vec.label(data, t))}</b>: {t.get(vec.value ? vec.options[1] : vec.options[0])}</p>
    {:else if vec instanceof MultiCheckboxWidget && vec.showTextValue(data)}
        <p><b>{t.get(vec.label(data, t))}</b>: {vec.value.map(s => t.get(s)).join(', ')}</p>
    {:else if vec instanceof CheckboxWidget && vec.showTextValue(data)}
        <p><b>{t.get(vec.label(data, t))}</b>: {vec.value ? t.yes : t.no}</p>
    {/if}
{/each}
<p><b>Zaevidoval</b>: {user.email}</p>