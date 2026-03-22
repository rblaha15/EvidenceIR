<script lang="ts">
    import type { ContextIN, FormIN } from '$lib/forms/IN/formIN';
    import type { Translations } from '$lib/translations';
    import type { User } from 'firebase/auth';
    import { extractIRIDFromParts } from '$lib/helpers/ir';
    import { detailIrUrl } from '$lib/helpers/runes.svelte';
    import ReadonlyWidget from '$lib/components/ReadonlyWidget.svelte';
    import { widgetList } from '$lib/forms/Form';

    interface Props {
        context: ContextIN;
        user: User;
        t: Translations;
        origin: string;
    }

    const {
        context,
        user,
        t,
        origin
    }: Props = $props();

    let list = $derived(widgetList<ContextIN, FormIN>(context.f, context.v));

    const irid = extractIRIDFromParts(context.v.ir.typ.first!, context.v.ir.cislo);
</script>

<p>Odkaz na podrobnosti evidence: <a href={origin + detailIrUrl(irid)}>{origin + detailIrUrl(irid)}</a></p>

{#each list as { widget, value }}
    <ReadonlyWidget {widget} {value} {t} {context} />
{/each}
<p><b>Zaevidoval</b>: {user.displayName || user.email}</p>