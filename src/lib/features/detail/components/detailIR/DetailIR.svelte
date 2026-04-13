<script lang="ts">
    import { isUserAdmin, isUserRegulusOrAdmin } from '$lib/client/auth';
    import { endUserEmails, type IRID } from '$lib/helpers/ir';
    import { detailIrUrl, iridUrl, relUrl } from '$lib/helpers/runes.svelte.js';
    import { type Translations } from '$lib/translations';
    import ServiceProtocols from './ServiceProtocols.svelte';
    import { aR, iaA } from '$lib/helpers/stores';
    import DK from './DK.svelte';
    import type { LanguageCode } from '$lib/languageCodes';
    import DocumentsIR from '$lib/features/detail/components/documentsIR/DocumentsIR.svelte';
    import Dates from '../Dates.svelte';
    import type { ExistingIR } from '$lib/data';
    import { downloadXML } from '$lib/features/detail/actions/detailIR/ir';
    import DeleteIR from '$lib/features/detail/components/detailIR/DeleteIR.svelte';
    import Button from '$lib/components/Button.svelte';
    import { unknownCompanyEmail } from '$lib/forms/IN/formIN';

    const { t, ir, lang, irid }: {
        t: Translations, ir: ExistingIR, lang: LanguageCode, irid: IRID,
    } = $props();
    const td = $derived(t.detail);
    const mf = $derived(ir.IN.montazka.email == unknownCompanyEmail ? '' : ir.IN.montazka.email.trim())
</script>

<div class="d-flex flex-wrap flex-lg-nowrap gap-4 justify-content-between">
    {#if !ir.isDraft}
        <div class="d-flex flex-column gap-5 flex-grow-1">
            <div class="d-flex flex-column gap-3">
                <h4 class="m-0">{td.documents}</h4>
                <div class="d-flex flex-column gap-1">
                    <DocumentsIR {ir} {t} {lang} {irid} />
                </div>
            </div>
            <div class="d-flex flex-column gap-3">
                <ServiceProtocols {ir} {t} {lang} {irid} />
            </div>
        </div>
    {/if}
    <div class="d-flex flex-column gap-3 flex-shrink-1 align-items-sm-start">
        <h4 class="m-0">{ir.isDraft ? td.draftManagement : td.recordManagement}</h4>
        <div class="d-flex flex-column gap-1 align-items-sm-start">
            {#if !ir.isDraft}
                <Button color="primary" icon="attach_email" text={td.sendDocuments}
                        href={relUrl(`/OD?redirect=${detailIrUrl()}&user=${endUserEmails(ir.IN.koncovyUzivatel).join(';')}&assembly=${mf}`)} />
            {/if}
            {#if ir.isDraft}
                <Button color="primary" icon="edit_document" text={td.editInstallationData}
                        href={relUrl(`/IN?edit-irid=${irid}`)} />
            {/if}
            <Button color="primary" icon="preview" text={td.viewFilledData}
                    href={relUrl(`/IN?view-irid=${irid}`)} />
            {#if $isUserAdmin}
                <Button color="secondary" icon="cloud_circle" text="{td.openInDatabase}{iaA}"
                        href="https://console.firebase.google.com/u/0/project/evidence-ir/firestore/databases/-default-/data/~2Fir~2F{irid}"
                        target="_blank" />
            {/if}
        </div>
        <div class="d-flex flex-column gap-1 align-items-sm-start">
            {#if $isUserRegulusOrAdmin}
                <Button color="info" icon="people" text="{td.usersWithAccess}{$aR}"
                        href={iridUrl('/users')} />
            {/if}
            {#if !ir.isDraft}
                <Button color="warning" icon="edit_document" text={td.editInstallationData}
                        href={relUrl(`/IN?edit-irid=${irid}`)} />
            {/if}
            <p class="m-0">{@html t.detail.changeControllerHtml}</p>
            <DeleteIR {irid} {td} />

            {#if $isUserRegulusOrAdmin && !ir.isDraft}
                <Button color="secondary" icon="download" text="{td.downloadXML}{$aR}"
                        onclick={downloadXML(ir)} />
            {/if}
        </div>

        {#if !ir.isDraft}
            <DK {ir} {irid} {t} type="TČ" />
            <DK {ir} {irid} {t} type="SOL" />
        {/if}

        <Dates data={ir} />
    </div>
</div>