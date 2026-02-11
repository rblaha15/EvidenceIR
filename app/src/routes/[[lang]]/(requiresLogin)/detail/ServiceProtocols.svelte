<script lang="ts">
    import { type IRID, spName } from '$lib/helpers/ir';
    import type { Translations } from '$lib/translations';
    import { iridUrl } from '$lib/helpers/runes.svelte';
    import PDFLink from './PDFLink.svelte';
    import { techniciansList } from '$lib/client/realtime';
    import { currentUser } from '$lib/client/auth';
    import { invalidateAll } from '$app/navigation';
    import { aR } from '$lib/helpers/stores';
    import Icon from '$lib/components/Icon.svelte';
    import type { LanguageCode } from '$lib/languageCodes';
    import type { ExistingIR } from '$lib/data';
    import db from '$lib/Database';

    const {
        irid, ir, lang, t,
    }: {
        irid: IRID, ir: ExistingIR, lang: LanguageCode, t: Translations,
    } = $props();
    const td = $derived(t.detail);

    const deleteSP = (i: number) => async () => {
        await db.deleteSP(irid, i);
    };

    const copySP = (i: number) => async () => {
        const ja = $techniciansList.find(t => $currentUser?.email == t.email);
        const p = ir.SPs[i];
        await db.addSP(irid!, {
            ...p,
            fakturace: {
                hotove: 'doNotInvoice',
                komu: { chosen: null, text: '' },
                jak: null,
                invoiceParts: [],
                discount: '',
                discountReason: '',
            },
            zasah: {
                ...p.zasah,
                clovek: ja?.name ?? p.zasah.clovek,
                inicialy: ja?.initials ?? p.zasah.inicialy,
            },
        });
        await invalidateAll();
    };
</script>

<h4 class="m-0">{td.serviceProtocols}{$aR}</h4>
{#if ir.SPs.length}
    <div class="d-flex flex-column gap-1 align-items-sm-start">
        {#each ir.SPs as p, i}
            {#snippet deleteButton()}
                <button class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#deleteProtocolModal-{i}">
                    <Icon icon="delete_forever" />
                    {td.delete}
                </button>
            {/snippet}
            {#snippet duplicateButton()}
                <button class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#duplicateModal-{i}">
                    <Icon icon="file_copy" />
                    {td.duplicate}
                </button>
            {/snippet}
            <PDFLink
                name={spName(p.zasah)} data={ir} {t} {lang} link="SP" index={i} {irid} dropdownItems={[{
                    color: 'primary',
                    icon: 'preview',
                    text: td.viewFilledData,
                    href: iridUrl(`/SP/?view=${i}`),
                }, {
                    color: 'warning',
                    icon: 'edit_document',
                    text: td.editProtocol,
                    href: iridUrl(`/SP/?edit=${i}`),
                }, {
                    item: deleteButton,
                }, {
                    item: duplicateButton,
                }]}
            />

            <div class="modal fade" id="duplicateModal-{i}" tabindex="-1" aria-labelledby="duplicateModalLabel-{i}" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="duplicateModalLabel-{i}">{td.duplicate}</h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            {td.copySP}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{td.no}</button>
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" onclick={copySP(i)}>{td.yes}</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal fade" id="deleteProtocolModal-{i}" tabindex="-1" aria-labelledby="deleteProtocolModal-{i}" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="deleteProtocolModal-{i}">
                                <Icon icon="delete_forever" />
                                {td.delete} {spName(p.zasah)}
                            </h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            {td.deleteSP}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">{td.no}</button>
                            <button type="button" class="btn btn-danger" data-bs-dismiss="modal" onclick={deleteSP(i)}>{td.yes}</button>
                        </div>
                    </div>
                </div>
            </div>
        {/each}
    </div>
{/if}

<div class="d-flex align-items-center gap-3 flex-wrap flex-sm-nowrap">
    <a class="btn btn-primary" href={iridUrl('/SP')} tabindex="0">
        <Icon icon="add" />
        {ir.SPs.length ? td.fillInAnotherProtocol : td.fillInProtocol}
    </a>
</div>