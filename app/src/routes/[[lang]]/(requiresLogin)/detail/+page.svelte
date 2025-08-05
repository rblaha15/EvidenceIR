<script lang="ts">
    import type { PageProps } from './$types';
    import { page } from '$app/state';
    import { setTitle } from '$lib/helpers/globals.js';
    import { irNumberFromIRID, irWholeName, spWholeName } from '$lib/helpers/ir';
    import DetailNSP from './DetailNSP.svelte';
    import DetailIR from './DetailIR.svelte';

    let { data }: PageProps = $props();
    const { irid, spid, ir, sp, languageCode: lang, translations: t } = $derived(data);
    const td = $derived(t.detail);

    const deleted = $derived(page.url.searchParams.has('deleted'));

    $effect(() => setTitle(spid ? td.titleNSP : td.titleIR, true));
</script>

{#if $ir || $sp}
    <h3 class="m-0">{$sp ? spWholeName($sp) : $ir ? irWholeName($ir.evidence) : ''}</h3>
{:else}
    <h3 class="m-0">
        {#if !irid}
            {spid?.replace('-', ' ').replace('-', '/').replace('-', '/').replaceAll('-', ':').replace(':', '-')}
        {:else}
            {irNumberFromIRID(irid)}
        {/if}
    </h3>
{/if}
{#if deleted}
    <div class="alert alert-success" role="alert">
        {td.successfullyDeleted}
    </div>
{/if}
{#if !$ir && !$sp}
    <div>{td.sorrySomethingWentWrong}</div>
    <div>
        {#if irid}
            {td.linkInvalidIR}
        {:else if spid}
            {td.linkInvalidNSP}
        {/if}
    </div>
{/if}
{#if spid && $sp}
    <DetailNSP {t} {lang} sp={$sp} {spid} />
{/if}
{#if irid && $ir}
    <DetailIR {t} {lang} ir={$ir} {irid} />
{/if}