<script lang="ts">
    import { type IRID, spName, szName } from '$lib/helpers/ir';
    import type { Translations } from '$lib/translations';
    import { iridUrl } from '$lib/helpers/runes.svelte.js';
    import PDFLink from '$lib/features/detail/components/documentsIR/PDFLink.svelte';
    import type { LanguageCode } from '$lib/languageCodes';
    import type { ExistingIR } from '$lib/data';
    import { copySP, deleteSP } from '$lib/features/detail/actions/detailIR/sp';
    import { isSP } from '$lib/forms/SP/infoSP.svelte';
    import SmallDropdown from '$lib/features/detail/components/documentsIR/SmallDropdown.svelte';
    import Button from '$lib/components/Button.svelte';
    import { isUserRegulusOrAdmin } from '$lib/client/auth';
    import { Copy, Eye, FilePen, Plus, Trash2 } from "@lucide/svelte";

    const {
        irid, ir, lang, t,
    }: {
        irid: IRID, ir: ExistingIR, lang: LanguageCode, t: Translations,
    } = $props();
    const td = $derived(t.detail);
    const r = $derived($isUserRegulusOrAdmin);
</script>

<h4 class="m-0">{r ? td.serviceProtocols : td.serviceInterventions}</h4>
{#if ir.SPs.length}
    <div class="flex flex-col gap-1 sm:items-start">
        {#each ir.SPs as p, i}
            {@const showSP = isSP(p) && r}
            {#snippet deleteButton()}
                <button class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#deleteProtocolModal-{i}">
                    <Trash2 />
                    {td.delete}
                </button>
            {/snippet}
            {#snippet duplicateButton()}
                <button class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#duplicateModal-{i}">
                    <Copy />
                    {td.duplicate}
                </button>
            {/snippet}
            {#if showSP}
                <PDFLink
                    name={spName(p.zasah)} data={ir} {t} {lang} link="SP" index={i} {irid} dropdownItems={[{
                        color: 'primary',
                        icon: Eye,
                        text: td.viewFilledData,
                        href: iridUrl(`/SP/?view=${i}`),
                    }, {
                        color: 'warning',
                        icon: FilePen,
                        text: td.editProtocol,
                        href: iridUrl(`/SP/?edit=${i}`),
                    }, {
                        item: deleteButton,
                    }, {
                        item: duplicateButton,
                    }]}
                />
            {:else}
                <div class="flex flex-row gap-4 items-center">
                    <Button text={szName(p.zasah)} href={iridUrl(`/SZ/?view=${i}`)} variant="link" icon={Eye} />
                    {#if !isSP(p)}
                        <SmallDropdown dropdownItems={[{
                            color: 'warning',
                            icon: FilePen,
                            text: td.editIntervention,
                            href: iridUrl(`/SZ/?edit=${i}`),
                        }]} />
                    {/if}
                </div>
            {/if}

            <div class="modal fade hidden" id="duplicateModal-{i}" tabindex="-1" aria-labelledby="duplicateModalLabel-{i}" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-12" id="duplicateModalLabel-{i}">{td.duplicate}</h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            {td.copySP}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{td.no}</button>
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" onclick={copySP(i, ir)}>{td.yes}</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal fade" id="deleteProtocolModal-{i}" tabindex="-1" aria-labelledby="deleteProtocolModal-{i}" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-12" id="deleteProtocolModal-{i}">
                                <Trash2 />
                                {td.delete} {isSP(p) ? spName(p.zasah) : ''}
                            </h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            {td.deleteSP}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">{td.no}</button>
                            <button type="button" class="btn btn-danger" data-bs-dismiss="modal"
                                    onclick={deleteSP(i, irid)}>{td.yes}</button>
                        </div>
                    </div>
                </div>
            </div>
        {/each}
    </div>
{/if}

<div class="flex items-center gap-4 flex-wrap sm:flex-nowrap">
    <a class="btn btn-primary" href={iridUrl(r ? '/SP' : '/SZ')} tabindex="0">
        <Plus />
        {r ? ir.SPs.length ? td.fillInAnotherProtocol : td.fillInProtocol
            : ir.SPs.length ? td.fillInAnotherIntervention : td.fillInIntervention}
    </a>
</div>