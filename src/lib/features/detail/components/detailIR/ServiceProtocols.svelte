<script lang="ts">
    import { type IRID, spName, szName } from '$lib/helpers/ir';
    import type { Translations } from '$lib/translations';
    import { iridUrl } from '$lib/helpers/runes.svelte.js';
    import PDFLink from '$lib/features/detail/components/documentsIR/PDFLink.svelte';
    import Icon from '$lib/components/Icon.svelte';
    import type { LanguageCode } from '$lib/languageCodes';
    import type { ExistingIR } from '$lib/data';
    import { copySP, deleteSP } from '$lib/features/detail/actions/detailIR/sp';
    import { isSP } from '$lib/forms/SP/infoSP.svelte';
    import SmallDropdown from '$lib/features/detail/components/documentsIR/SmallDropdown.svelte';
    import Button from '$lib/components/Button.svelte';
    import { isUserRegulusOrAdmin } from '$lib/client/auth';

    const {
        irid, ir, lang, t,
    }: {
        irid: IRID, ir: ExistingIR, lang: LanguageCode, t: Translations,
    } = $props();
    const td = $derived(t.detail);
    const r = $derived($isUserRegulusOrAdmin);
    const any = $derived(!!ir.SPs.keys().length);
    const sorted = $derived(ir.SPs.entries().sortedBy(([_, p]) => new Date(p.zasah.datum)));
</script>

<h4 class="m-0">{r ? td.serviceProtocols : td.serviceInterventions}</h4>
{#if any}
    <div class="d-flex flex-column gap-1 align-items-sm-start">
        {#each sorted as [id, p]}
            {@const showSP = isSP(p) && r}
            {#snippet deleteButton()}
                <button class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#deleteProtocolModal-{id}">
                    <Icon icon="delete_forever" />
                    {td.delete}
                </button>
            {/snippet}
            {#snippet duplicateButton()}
                <button class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#duplicateModal-{id}">
                    <Icon icon="file_copy" />
                    {td.duplicate}
                </button>
            {/snippet}
            {#if showSP}
                <PDFLink
                    name={spName(p.zasah)} data={ir} {t} {lang} link="SP" {id} {irid} dropdownItems={[{
                        color: 'primary',
                        icon: 'preview',
                        text: td.viewFilledData,
                        href: iridUrl(`/SP/?view=${id}`),
                    }, {
                        color: 'warning',
                        icon: 'edit_document',
                        text: td.editProtocol,
                        href: iridUrl(`/SP/?edit=${id}`),
                    }, {
                        item: deleteButton,
                    }, {
                        item: duplicateButton,
                    }]} signed={ir.signatures?.SP?.[i]?.state == 'signed'}
                />
            {:else}
                <div class="d-flex flex-row gap-3 align-items-center">
                    <Button text={szName(p.zasah)} href={iridUrl(`/SZ/?view=${id}`)} link icon="preview" />
                    {#if !isSP(p)}
                        <SmallDropdown dropdownItems={[{
                            color: 'warning',
                            icon: 'edit_document',
                            text: td.editIntervention,
                            href: iridUrl(`/SZ/?edit=${id}`),
                        }]} />
                    {/if}
                </div>
            {/if}

            <div class="modal fade" id="duplicateModal-{id}" tabindex="-1" aria-labelledby="duplicateModalLabel-{id}" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="duplicateModalLabel-{id}">{td.duplicate}</h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            {td.copySP}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{td.no}</button>
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" onclick={copySP(id, ir)}>{td.yes}</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal fade" id="deleteProtocolModal-{id}" tabindex="-1" aria-labelledby="deleteProtocolModal-{id}" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="deleteProtocolModal-{id}">
                                <Icon icon="delete_forever" />
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
                                    onclick={deleteSP(id, irid)}>{td.yes}</button>
                        </div>
                    </div>
                </div>
            </div>
        {/each}
    </div>
{/if}

<div class="d-flex align-items-center gap-3 flex-wrap flex-sm-nowrap">
    <a class="btn btn-primary" href={iridUrl(r ? '/SP' : '/SZ')} tabindex="0">
        <Icon icon="add" />
        {r ? any ? td.fillInAnotherProtocol : td.fillInProtocol
            : any ? td.fillInAnotherIntervention : td.fillInIntervention}
    </a>
</div>