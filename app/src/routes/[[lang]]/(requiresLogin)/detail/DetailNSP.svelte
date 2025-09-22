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

    const { t, sp, lang }: {
        t: Translations, sp: Raw<FormNSP>, lang: LanguageCode,
    } = $props();
    const td = $derived(t.detail);
    const spid = $derived(extractSPIDFromRawData(sp.zasah));
</script>

<PDFLink data={sp} link="NSP" name={spName(sp.zasah)} {spid} {t}>
    {#snippet dropdown()}
        <li>
            <span class="d-flex align-items-center dropdown-item">
                <span class="text-primary material-icons">preview</span>
                <a class="text-primary dropdown-item" href={relUrl(`/NSP?view-spid=${spid}`)}>{td.viewFilledData}</a>
            </span>
        </li>
        <li>
            <span class="d-flex align-items-center dropdown-item">
                <span class="text-warning material-icons">edit_document</span>
                <a class="text-warning dropdown-item" href={relUrl(`/NSP?edit-spid=${spid}`)}>{td.editProtocol}</a>
            </span>
        </li>
        {#if $isUserAdmin}
            <li>
                <span class="d-flex align-items-center dropdown-item">
                    <span class="text-danger material-icons">delete_forever</span>
                    <button class="text-danger dropdown-item" onclick={() => {
                        db.deleteIndependentProtocol(spid);
                        goto(spidUrl(`/detail?deleted`), { replaceState: true });
                    }}>{td.deleteProtocol}{$aA}</button>
                </span>
            </li>
        {/if}
    {/snippet}
</PDFLink>