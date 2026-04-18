<script lang="ts">
    import { type IRID, irLabel, irNumberFromIRID, irWholeName, type SPID } from '$lib/helpers/ir';
    import type { IR, NSP } from '$lib/data';
    import type { LanguageCode } from '$lib/languageCodes';
    import type { Translations } from '$lib/translations';
    import DetailNSPs from '$lib/features/detail/components/DetailNSPs.svelte';
    import DetailIR from '$lib/features/detail/components/detailIR/DetailIR.svelte';
    import DetailDeletedIR from '$lib/features/detail/components/DetailDeletedIR.svelte';
    import { PencilRuler, X } from "@lucide/svelte";

    let { irid, spids, ir, sps, lang, t, justDeleted }: {
        irid: IRID | null,
        spids: SPID[],
        ir?: IR,
        sps: NSP[],
        lang: LanguageCode,
        t: Translations,
        justDeleted?: boolean,
    } = $props();
    const td = $derived(t.detail);

</script>
<div class="flex flex-col gap-12">
    {#if ir && !ir.deleted}
        <h2>
            {#if ir.isDraft}
                <PencilRuler />
            {/if}
            {irWholeName(ir.IN)}
        </h2>
    {:else if sps.length && !sps[0].deleted}
        <h2>
            {irLabel(sps[0].NSP)}
        </h2>
    {:else}
        <h2>
            {#if ir && ir.deleted || sps.length && sps[0].deleted}
                <X />
            {/if}
            {#if irid}
                {irNumberFromIRID(irid)}
            {:else if spids.length === 1}
                {spids[0].replace('-', ' ').replace('-', '/').replace('-', '/').replaceAll('-', ':').replace(':', '-')}
            {/if}
        </h2>
    {/if}
    {#if justDeleted}
        <div class="alert alert-success" role="alert">
            {td.successfullyDeleted}
        </div>
    {/if}
    {#if !ir && !sps.length}
        <div>{td.sorrySomethingWentWrong}</div>
        <div>
            {#if irid}
                {td.linkInvalidIR}
            {:else if spids.length}
                {td.linkInvalidNSP}
            {/if}
        </div>
    {/if}
    {#if ir && ir.deleted}
        <DetailDeletedIR {td} {ir} />
    {/if}
    {#if spids && sps.length}
        <DetailNSPs {t} {lang} {sps} />
    {/if}
    {#if irid && ir && !ir.deleted}
        <DetailIR {t} {lang} {ir} {irid} />
    {/if}
</div>