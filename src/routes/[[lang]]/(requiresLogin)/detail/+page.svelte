<script lang="ts">
    import type { PageProps } from './$types';
    import { page } from '$app/state';
    import { setTitle } from '$lib/helpers/globals.js';
    import { irLabel, irNumberFromIRID, irWholeName, isSPDeleted } from '$lib/helpers/ir';
    import DetailIR from './DetailIR.svelte';
    import DetailNSPs from './DetailNSPs.svelte';
    import Icon from '$lib/components/Icon.svelte';
    import { detailIrUrl } from '$lib/helpers/runes.svelte';

    let { data }: PageProps = $props();
    const { irid, spids, ir, sps, languageCode: lang, translations: t } = $derived(data);
    const td = $derived(t.detail);

    const deleted = $derived(page.url.searchParams.has('deleted'));

    $effect(() => setTitle(spids.length ? spids.length > 1 ? td.titleNSPs : td.titleNSP : td.titleIR, true));
</script>

<div class="d-flex flex-column gap-5">
    {#if $ir && !$ir.deleted}
        <h3 class="m-0">
            {#if $ir.isDraft}
                <Icon icon="design_services" class="text-warning" />
            {/if}
            {irWholeName($ir.evidence)}
        </h3>
    {:else if $sps.length && !isSPDeleted($sps[0])}
        <h3 class="m-0">
            {irLabel($sps[0])}
        </h3>
    {:else}
        <h3 class="m-0">
            {#if irid}
                {irNumberFromIRID(irid)}
            {:else if spids.length === 1}
                {spids[0].replace('-', ' ').replace('-', '/').replace('-', '/').replaceAll('-', ':').replace(':', '-')}
            {/if}
        </h3>
    {/if}
    {#if deleted}
        <div class="alert alert-success" role="alert">
            {td.successfullyDeleted}
        </div>
    {/if}
    {#if !$ir && !$sps.length}
        <div>{td.sorrySomethingWentWrong}</div>
        <div>
            {#if irid}
                {td.linkInvalidIR}
            {:else if spids.length}
                {td.linkInvalidNSP}
            {/if}
        </div>
    {/if}
    {#if $ir && $ir.deleted}
        <div>{td.sorrySomethingWentWrong}</div>
        <div>
            {#if $ir.movedTo}
                {@html td.movedIRHtml({ link: detailIrUrl($ir.movedTo) })}
            {:else}
                {td.deletedIR}
            {/if}
        </div>
    {/if}
    {#if spids && $sps.length && !isSPDeleted($sps[0])}
        <DetailNSPs {t} {lang} sps={$sps} />
    {/if}
    {#if irid && $ir && !$ir.deleted}
        <DetailIR {t} {lang} ir={$ir} {irid} />
    {/if}
</div>