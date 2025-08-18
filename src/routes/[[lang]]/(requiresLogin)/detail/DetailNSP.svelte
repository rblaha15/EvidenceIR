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

    const { t, sp, lang }: {
        t: Translations, sp: Raw<FormNSP>, lang: LanguageCode,
    } = $props();
    const td = $derived(t.detail);
    const spid = $derived(extractSPIDFromRawData(sp.zasah));
</script>

<div class="d-flex flex-column gap-1 align-items-sm-start">
    <PDFLink breakpoint={$isUserAdmin ? 'lg' : 'md'} data={sp} hideLanguageSelector={true} {lang} link="NSP" name={spName(sp.zasah)} {spid} {t}>
        <a class="btn btn-primary" href={relUrl(`/NSP?view-spid=${spid}`)} tabindex="0">
            {td.viewFilledData}
        </a>

        {#if $isUserAdmin}
            <button class="btn btn-danger d-block" onclick={() => {
                db.deleteIndependentProtocol(spid);
                goto(spidUrl(`/detail?deleted`), { replaceState: true });
            }}>
                {td.deleteProtocol}
            </button>
        {/if}
    </PDFLink>
</div>