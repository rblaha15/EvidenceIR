<script lang="ts">
    import type { PageProps } from './$types';
    import { page } from '$app/state';
    import { setTitle } from '$lib/helpers/globals.js';
    import { irNumberFromIRID, irWholeName, spWholeName } from '$lib/helpers/ir';
    import DetailNSP from './DetailNSP.svelte';
    import DetailIR from './DetailIR.svelte';

    let { data }: PageProps = $props();
    const { irid, spid, ir, sp, success, languageCode: lang, translations: t } = $derived(data);

    const deleted = $derived(page.url.searchParams.has('deleted'));

    $effect(() => setTitle(spid ? 'Instalační a servisní protokol' : t.evidenceDetails, true));
</script>

{#if success}
    <h3 class="m-0">{sp ? spWholeName(sp) : ir ? irWholeName(ir.evidence) : ''}</h3>
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
        {t.successfullyDeleted}
    </div>
{/if}
{#if !success}
    <div>{t.sorrySomethingWentWrong}</div>
    <div>
        {#if irid}
            {t.linkInvalid}
        {:else if spid}
            Buď protokol neexistuje nebo k němu nemáte přístup.
        {/if}
    </div>
{/if}
{#if success && spid && sp}
    <DetailNSP {t} {lang} {sp} {spid} />
{/if}
{#if success && irid && ir}
    <DetailIR {t} {lang} {ir} {irid} />
{/if}