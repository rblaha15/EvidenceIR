<script lang="ts">
    import type { PageProps } from './$types';
    import { page } from '$app/state';
    import { setTitle } from '$lib/helpers/globals.js';
    import { irLabel, irNumberFromIRID, irWholeName } from '$lib/helpers/ir';
    import DetailIR from './DetailIR.svelte';
    import DetailNSPs from './DetailNSPs.svelte';

    let { data }: PageProps = $props();
    const { irid, spids, ir, sps, languageCode: lang, translations: t } = $derived(data);
    const td = $derived(t.detail);

    const deleted = $derived(page.url.searchParams.has('deleted'));

    $effect(() => setTitle(spids.length ? spids.length > 1 ? td.titleNSPs : td.titleNSP : td.titleIR, true));
</script>

{#if $ir || $sps.length}
    <h3 class="m-0">{$sps.length ? irLabel($sps[0]) : $ir ? irWholeName($ir.evidence) : ''}</h3>
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
{#if spids && $sps.length}
    <DetailNSPs {t} {lang} sps={$sps} />
{/if}
{#if irid && $ir}
    <DetailIR {t} {lang} ir={$ir} {irid} />
{/if}