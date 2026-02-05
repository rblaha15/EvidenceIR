<script lang="ts">
    import type { PageProps } from './$types';
    import { page } from '$app/state';
    import { setTitle } from '$lib/helpers/globals.js';
    import { irLabel, irNumberFromIRID, irWholeName } from '$lib/helpers/ir';
    import DetailIR from './DetailIR.svelte';
    import DetailNSPs from './DetailNSPs.svelte';
    import Icon from '$lib/components/Icon.svelte';
    import { detailIrUrl, relUrl } from '$lib/helpers/runes.svelte';
    import { isUserAdmin } from '$lib/client/auth';
    import { aA } from '$lib/helpers/stores';
    import Dates from './Dates.svelte';

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
            {irWholeName($ir.IN)}
        </h3>
    {:else if $sps.length && !$sps[0].deleted}
        <h3 class="m-0">
            {irLabel($sps[0].NSP)}
        </h3>
    {:else}
        <h3 class="m-0">
            {#if $ir && $ir.deleted || $sps.length && $sps[0].deleted}
                <Icon icon="delete" class="text-danger" />
            {/if}
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
            {#if $ir.meta.movedTo}
                {@html td.movedIRHtml({ link: detailIrUrl($ir.meta.movedTo) })}
            {:else}
                {td.deletedIR}
            {/if}
        </div>
        {#if $isUserAdmin}
            <div class="d-flex flex-column align-items-end gap-1">
                <a class="btn btn-secondary" href={relUrl(`/IN?view-irid=${irid}`)}
                   tabindex="0">
                    <Icon icon="preview" />
                    {td.viewFilledData}{$aA}
                </a>
                <a tabindex="0" class="btn btn-secondary" target="_blank"
                   href="https://console.firebase.google.com/u/0/project/evidence-ir/firestore/databases/-default-/data/~2Fir~2F{irid}">
                    <Icon icon="cloud_circle" />
                    {td.openInDatabase}{$aA}
                </a>
            </div>
        {/if}

        <div class="d-flex flex-column align-items-end">
            <Dates data={$ir} />
        </div>
    {/if}
    {#if spids && $sps.length}
        <DetailNSPs {t} {lang} sps={$sps} />
    {/if}
    {#if irid && $ir && !$ir.deleted}
        <DetailIR {t} {lang} ir={$ir} {irid} />
    {/if}
</div>