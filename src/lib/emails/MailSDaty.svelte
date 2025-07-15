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
    import ReadonlyWidget from '$lib/components/ReadonlyWidget.svelte';

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

{#each list as widget}
    <ReadonlyWidget {widget} {t} {data} />
{/each}
<p><b>Zaevidoval</b>: {user.email}</p>