<script lang="ts">
    import type { ContextIN, FormIN } from '$lib/forms/IN/formIN';
    import { appUrl } from '$lib/helpers/globals';
    import type { Translations } from '$lib/translations';
    import type { User } from '$lib/client/auth';
    import { extractIRIDFromParts } from '$lib/helpers/ir';
    import { detailUrlIR } from '$lib/helpers/runes.svelte';
    import ReadonlyWidget from '$lib/components/ReadonlyWidget.svelte';
    import { widgetList } from '$lib/forms/Form';

    interface Props {
        context: ContextIN;
        user: User;
        t: Translations;
    }

    const {
        context,
        user,
        t,
    }: Props = $props();

    let list = $derived(widgetList<ContextIN, FormIN>(context.f, context.v));

    // svelte-ignore state_referenced_locally
    const irid = extractIRIDFromParts(context.v.ir.typ.first!, context.v.ir.cislo);
</script>

<p>Odkaz na podrobnosti evidence: <a href={appUrl + detailUrlIR(irid)}>{appUrl + detailUrlIR(irid)}</a></p>

{#each list as { widget, value }}
    <ReadonlyWidget {widget} {value} {t} {context} />
{/each}
<p><b>Zaevidoval</b>: {user.name}</p>