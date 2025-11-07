<script lang="ts">
    import PDFLink from './PDFLink.svelte';
    import { isUserAdmin, isUserRegulusOrAdmin } from '$lib/client/auth';
    import { type IRID, supportsRemoteAccess } from '$lib/helpers/ir';
    import { detailIrUrl, iridUrl, relUrl } from '$lib/helpers/runes.svelte.js';
    import { getTranslations, type Translations } from '$lib/translations';
    import db, { type IR } from '$lib/data';
    import ServiceProtocols from './ServiceProtocols.svelte';
    import { cascadePumps } from '$lib/forms/IN/infoIN';
    import type { LanguageCode } from '$lib/languages';
    import { goto } from '$app/navigation';
    import ChangeIRID from './ChangeIRID.svelte';
    import { aA, aR } from '$lib/helpers/stores';
    import RKD from './RKD.svelte';
    import Icon from '$lib/components/Icon.svelte';
    import { createFileUrl, downloadFile } from '../../helpers';
    import { xmlIN } from '$lib/forms/IN/xmlIN';
    import { rawDataToData } from '$lib/forms/Form.js';
    import defaultIN from '$lib/forms/IN/defaultIN';

    const { t, ir, lang, irid }: {
        t: Translations, ir: IR, lang: LanguageCode, irid: IRID,
    } = $props();
    const td = $derived(t.detail);

    const remove = async () => {
        await db.deleteIR(irid!);
        await goto(iridUrl(`/detail?deleted`), { replaceState: true });
    };

    const download = async () => {
        const xml = xmlIN(rawDataToData(defaultIN(), ir.evidence), getTranslations('cs'));
        const blob = new Blob([xml], {
            type: 'application/xml',
        });
        const url = await createFileUrl(blob);
        downloadFile(url, `Evidence ${irid}.xml`);
    };
</script>

<div class="d-flex flex-wrap gap-5 justify-content-between">
    <div class="d-flex flex-column gap-5">
        <div class="d-flex flex-column gap-3">
            <h4 class="m-0">Dokumenty</h4>
            <div class="d-flex flex-column gap-1">
                {#if ir.evidence.vzdalenyPristup.chce}
                    <PDFLink name={t.rr.name} {t} link="RR" data={ir} {irid} />
                {/if}
                {#if supportsRemoteAccess(ir.evidence.ir.typ.first)}
                    <PDFLink name={t.nn.title} {t} link="NN" data={ir} {irid} />
                {/if}
                {#if ir.evidence.ir.typ.second === 'TRS6 K'}
                    <PDFLink name={t.nnt.title} {t} link="NNT" data={ir} />
                {/if}
                {#if ir.evidence.ir.chceVyplnitK.includes('heatPump')}
                    <PDFLink
                        disabled={!ir.uvedeniTC} name={t.tc.name} {t} link="UPT"
                        data={ir} {irid} additionalButton={{
                            href: iridUrl('/UPT'),
                            text: t.tc.commission,
                            important: true,
                        }} dropdownItems={$isUserRegulusOrAdmin ? [{
                            color: 'warning',
                            icon: 'edit_document',
                            text: td.editProtocol + $aR,
                            href: iridUrl(`/UPT/?edit`),
                        }] : undefined}
                    />
                    {#each cascadePumps(ir.evidence) as tc}
                        <PDFLink name={t.zlt.name(tc)} {t} link="ZLT" data={ir} pump={tc.N} {irid} />
                    {/each}
                    {#each cascadePumps(ir.evidence) as tc}
                        <PDFLink
                            name={t.rkt.name(tc)} {t} link="RKT" data={ir} pump={tc.N} {irid}
                            disabled={!ir.kontrolyTC[tc.N]?.keys()?.length} additionalButton={{
                                show: true,
                                href: iridUrl(`/RKT?pump=${tc.N}`),
                                text: t.rkt.fillOut(tc),
                                important: ir.yearlyHeatPumpCheckRecommendation?.state === 'sentRequest',
                            }} dropdownItems={$isUserAdmin ? ir.kontrolyTC[tc.N]?.keys().flatMap(y => [{
                                text: `${t.rkt.year} ${y}`,
                            }, {
                                color: 'warning',
                                icon: 'edit_document',
                                text: td.editCheck + $aA,
                                href: iridUrl(`/RKT?pump=${tc.N}&edit-year=${y}`),
                            }]) : undefined}
                        />
                    {/each}
                {/if}
                {#if ir.evidence.ir.chceVyplnitK.includes('solarCollector')}
                    <PDFLink
                        disabled={!ir.uvedeniSOL} name={t.sol.name} {t}
                        link="UPS" data={ir} {irid} additionalButton={{
                            href: iridUrl('/UPS'),
                            text: t.sol.commission,
                            important: true,
                        }} dropdownItems={$isUserRegulusOrAdmin ? [{
                            color: 'warning',
                            icon: 'edit_document',
                            text: td.editProtocol + $aR,
                            href: iridUrl(`/UPS?edit`),
                        }] : undefined}
                    />
                    <PDFLink name={t.zls.name} {t} link="ZLS" data={ir} {irid} />
                    <PDFLink
                        name={t.rks.name} {t} link="RKS" data={ir} {irid}
                        disabled={!ir.kontrolySOL?.keys()?.length} additionalButton={{
                            show: true,
                            href: iridUrl(`/RKS`),
                            text: t.rks.fillOut,
                            important: ir.yearlySolarSystemCheckRecommendation?.state === 'sentRequest',
                        }} dropdownItems={$isUserAdmin ? ir.kontrolySOL?.keys().flatMap(y => [{
                            text: `${t.rks.year} ${y}`,
                        }, {
                            color: 'warning',
                            icon: 'edit_document',
                            text: td.editCheck + $aA,
                            href: iridUrl(`/RKS?edit-year=${y}`),
                        }]) : undefined}
                    />
                {/if}
                {#if ir.evidence.ir.chceVyplnitK.includes('photovoltaicPowerPlant')}
                    <PDFLink
                        disabled={!ir.uvedeniFVE}
                        name={t.fve.name} {t} link="UPF" data={ir} {irid} additionalButton={{
                            href: iridUrl('/UPF'),
                            text: t.fve.commission,
                            important: true,
                        }}
                    />
                {/if}
                {#if ir.evidence.ir.typ.first === 'IR 14'}
                    <PDFLink
                        name={t.ft.title} {t} link="FT" data={ir} {irid}
                        disabled={!ir.faceTable} additionalButton={{
                            href: iridUrl('/FT'),
                            text: t.ft.setUp,
                        }}
                    />
                {/if}
            </div>
        </div>
        {#if $isUserRegulusOrAdmin}
            <div class="d-flex flex-column gap-3">
                <ServiceProtocols {ir} {t} {lang} {irid} />
            </div>
        {/if}
    </div>
    <div class="d-flex flex-column gap-3">
        <h4 class="m-0">Správa evidence</h4>
        <div class="d-flex flex-column gap-1 align-items-sm-start">
            <a class="btn btn-primary" href={relUrl(`/OD?redirect=${detailIrUrl()}&user=${ir.evidence.koncovyUzivatel.email}`)}
               tabindex="0">
                <Icon icon="attach_email" />
                {td.sendDocuments}
            </a>
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
            <ChangeIRID {ir} {irid} {t} />
            <a class="btn btn-warning" href={relUrl(`/IN?edit-irid=${irid}`)}
               tabindex="0">
                <Icon icon="edit_document" />
                {td.editInstallationData}
            </a>
            <button class="btn btn-danger d-block"
                    data-bs-target="#deleteModal" data-bs-toggle="modal">
                <Icon icon="delete_forever" />
                {td.deleteThisRecord}
            </button>

            {#if $isUserRegulusOrAdmin}
                <button class="btn btn-secondary d-block" onclick={download}>
                    <Icon icon="download" />
                    {td.downloadXML}{$aR}
                </button>
            {/if}

            <div aria-hidden="true" aria-labelledby="deleteModalLabel" class="modal fade" id="deleteModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="deleteModalLabel">{td.delete}</h1>
                            <button aria-label="Close" class="btn-close" data-bs-dismiss="modal" type="button"></button>
                        </div>
                        <div class="modal-body">
                            <Icon icon="delete_forever" />
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

        <RKD {ir} {irid} {t} type="TČ" />
        <RKD {ir} {irid} {t} type="SOL" />
    </div>
</div>