<script lang="ts">
    import { relUrl, spidUrl } from '$lib/helpers/runes.svelte';
    import PDFLink from './PDFLink.svelte';
    import { isUserAdmin } from '$lib/client/auth';
    import db from '$lib/data';
    import { goto } from '$app/navigation';
    import type { LanguageCode } from '$lib/languages';
    import { type Translations } from '$lib/translations';
    import { type FormNSP } from '$lib/forms/NSP/formNSP';
    import type { Raw } from '$lib/forms/Form';
    import { extractSPIDFromRawData, spName } from '$lib/helpers/ir';
    import { aA } from '$lib/helpers/stores';

    const { t, sp }: {
        t: Translations, sp: Raw<FormNSP>, lang: LanguageCode,
    } = $props();
    const td = $derived(t.detail);
    const spid = $derived(extractSPIDFromRawData(sp.zasah));
</script>

{#snippet deleteButton()}
    <button class="btn btn-danger" onclick={() => {
        db.deleteIndependentProtocol(spid);
        goto(spidUrl(`/detail?deleted`), { replaceState: true });
    }}>
        <span class="material-icons">delete_forever</span>
        {td.deleteProtocol}{$aA}
    </button>
{/snippet}

<PDFLink
    data={sp} link="NSP" name={spName(sp.zasah)} {spid} {t} dropdownItems={[{
        color: 'primary',
        icon: 'preview',
        text: td.viewFilledData,
        href: relUrl(`/NSP?view-spid=${spid}`),
    }, {
        color: 'warning',
        icon: 'edit_document',
        text: td.editProtocol,
        href: relUrl(`/NSP?edit-spid=${spid}`),
    }, {
        item: deleteButton,
        hide: !$isUserAdmin,
    }]}>
</PDFLink>