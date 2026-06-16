<script lang="ts">
    import { type IRID, irLabel, irNumberFromIRID, irWholeName, type NSPID } from '$lib/helpers/ir';
    import type { IR, NSP } from '$lib/data';
    import type { LanguageCode } from '$lib/languageCodes';
    import type { Translations } from '$lib/translations';
    import DetailNSPs from '$lib/features/detail/components/DetailNSPs.svelte';
    import DetailIR from '$lib/features/detail/components/detailIR/DetailIR.svelte';
    import DetailDeletedIR from '$lib/features/detail/components/DetailDeletedIR.svelte';
    import { PencilRuler, Trash2 } from "@lucide/svelte";
    import { Alert, AlertTitle } from "$lib/components/ui/alert";

    let { irid, nspids, ir, nsps, lang, t, justDeleted }: {
        irid: IRID | null,
        nspids: NSPID[],
        ir: IR | null,
        nsps: NSP[],
        lang: LanguageCode,
        t: Translations,
        justDeleted?: boolean,
    } = $props();
    const td = $derived(t.detail);

</script>
<div class="flex flex-col gap-12">
    <h2 class="flex items-center gap-2">
        {#if ir && !ir.deleted}
            {#if ir.isDraft}
                <PencilRuler class="text-warning" />
            {/if}
            {irWholeName(ir.IN)}
        {:else if nsps.length && !nsps[0].deleted}
            {irLabel(nsps[0].NSP)}
        {:else}
            {#if ir && ir.deleted || nsps.length && nsps[0].deleted}
                <Trash2 class="text-danger" />
            {/if}
            {#if irid}
                {irNumberFromIRID(irid)}
            {:else if nspids.length === 1}
                {nspids[0].replace('-', ' ').replace('-', '/').replace('-', '/').replaceAll('-', ':').replace(':', '-')}
            {/if}
        {/if}
    </h2>
    {#if justDeleted}
        <Alert variant="success">
            <Trash2 />
            <AlertTitle>{td.successfullyDeleted}</AlertTitle>
        </Alert>
    {/if}
    {#if !ir && !nsps.length}
        <div>{td.sorrySomethingWentWrong}</div>
        <div>
            {#if irid}
                {td.linkInvalidIR}
            {:else if nspids.length}
                {td.linkInvalidNSP}
            {/if}
        </div>
    {/if}
    {#if ir && ir.deleted}
        <DetailDeletedIR {td} {ir} />
    {/if}
    {#if nspids && nsps.length}
        <DetailNSPs {t} {lang} {nsps} />
    {/if}
    {#if irid && ir && !ir.deleted}
        <DetailIR {t} {lang} {ir} {irid} />
    {/if}
</div>