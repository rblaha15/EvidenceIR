<script lang="ts">
    import { isUserAdmin, isUserRegulusOrAdmin } from '$lib/client/auth';
    import { endUserEmails, type IRID } from '$lib/helpers/ir';
    import { detailIrUrl, iridUrl, relUrl } from '$lib/helpers/runes.svelte.js';
    import { getTranslations, type Translations } from '$lib/translations';
    import ServiceProtocols from './ServiceProtocols.svelte';
    import { goto } from '$app/navigation';
    import ChangeIRID from './ChangeIRID.svelte';
    import { aA, aR } from '$lib/helpers/stores';
    import DK from './DK.svelte';
    import Icon from '$lib/components/Icon.svelte';
    import { xmlIN } from '$lib/forms/IN/xmlIN';
    import { rawDataToData } from '$lib/forms/Form.js';
    import defaultIN from '$lib/forms/IN/defaultIN';
    import type { LanguageCode } from '$lib/languageCodes';
    import DocumentsIR from './DocumentsIR.svelte';
    import { createFileUrl, downloadFile } from '$lib/helpers/files';
    import Dates from './Dates.svelte';
    import type { ExistingIR } from '$lib/data';
    import db from '$lib/Database';

    const { t, ir, lang, irid }: {
        t: Translations, ir: ExistingIR, lang: LanguageCode, irid: IRID,
    } = $props();
    const td = $derived(t.detail);

    const remove = async () => {
        await db.deleteIR(irid!);
        await goto(iridUrl(`/detail?deleted`), { replaceState: true });
    };

    const download = async () => {
        const xml = xmlIN(rawDataToData(defaultIN(), ir.IN), getTranslations('cs'));
        const blob = new Blob([xml], {
            type: 'application/xml',
        });
        const url = await createFileUrl(blob);
        downloadFile(url, `Evidence ${irid}.xml`);
    };
</script>

<div class="d-flex flex-wrap gap-4 justify-content-between">
    {#if !ir.isDraft}
        <div class="d-flex flex-column gap-5">
            <div class="d-flex flex-column gap-3">
                <h4 class="m-0">{td.documents}</h4>
                <div class="d-flex flex-column gap-1">
                    <DocumentsIR {ir} {t} {lang} {irid} />
                </div>
            </div>
            {#if $isUserRegulusOrAdmin}
                <div class="d-flex flex-column gap-3">
                    <ServiceProtocols {ir} {t} {lang} {irid} />
                </div>
            {/if}
        </div>
    {/if}
    <div class="d-flex flex-column gap-3">
        <h4 class="m-0">{ir.isDraft ? td.draftManagement : td.recordManagement}</h4>
        <div class="d-flex flex-column gap-1 align-items-sm-start">
            {#if !ir.isDraft}
                <a class="btn btn-primary"
                   href={relUrl(`/OD?redirect=${detailIrUrl()}&user=${endUserEmails(ir.IN.koncovyUzivatel).join(';')}`)}
                   tabindex="0">
                    <Icon icon="attach_email" />
                    {td.sendDocuments}
                </a>
            {/if}
            {#if ir.isDraft}
                <a class="btn btn-primary" href={relUrl(`/IN?edit-irid=${irid}`)}
                   tabindex="0">
                    <Icon icon="edit_document" />
                    {td.editInstallationData}
                </a>
            {/if}
            <a class="btn btn-primary" href={relUrl(`/IN?view-irid=${irid}`)}
               tabindex="0">
                <Icon icon="preview" />
                {td.viewFilledData}
            </a>
            {#if $isUserAdmin}
                <a tabindex="0" class="btn btn-secondary" target="_blank"
                   href="https://console.firebase.google.com/u/0/project/evidence-ir/firestore/databases/-default-/data/~2Fir~2F{irid}">
                    <Icon icon="cloud_circle" />
                    {td.openInDatabase}{$aA}
                </a>
            {/if}
        </div>
        <div class="d-flex flex-column gap-1 align-items-sm-start">
            {#if $isUserRegulusOrAdmin}
                <a tabindex="0" class="btn btn-info" href={iridUrl('/users')}>
                    <Icon icon="people" />
                    {td.usersWithAccess}{$aR}
                </a>
            {/if}
            {#if !ir.isDraft}
                <a class="btn btn-warning" href={relUrl(`/IN?edit-irid=${irid}`)}
                   tabindex="0">
                    <Icon icon="edit_document" />
                    {td.editInstallationData}
                </a>
            {/if}
            <ChangeIRID {ir} {irid} {t} />
            <button class="btn btn-secondary d-block"
                    data-bs-target="#deleteModal" data-bs-toggle="modal">
                <Icon icon="delete_forever" />
                {td.deleteThisRecord}
            </button>

            {#if $isUserRegulusOrAdmin && !ir.isDraft}
                <button class="btn btn-secondary d-block" onclick={download}>
                    <Icon icon="download" />
                    {td.downloadXML}{$aR}
                </button>
            {/if}

            <div aria-hidden="true" aria-labelledby="deleteModalLabel" class="modal fade" id="deleteModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="deleteModalLabel">
                                <Icon icon="delete_forever" />
                                {td.delete}
                            </h1>
                            <button aria-label="Close" class="btn-close" data-bs-dismiss="modal" type="button"></button>
                        </div>
                        <div class="modal-body">
                            {td.confirmDeletion}
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-primary" data-bs-dismiss="modal" type="button">{td.cancel}</button>
                            <button class="btn btn-danger" onclick={remove} type="button">{td.delete}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {#if !ir.isDraft}
            <DK {ir} {irid} {t} type="TČ" />
            <DK {ir} {irid} {t} type="SOL" />
        {/if}

        <Dates data={ir} />
    </div>
</div>