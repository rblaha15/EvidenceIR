<script lang="ts">
    import PDFLink from './PDFLink.svelte';
    import { isUserAdmin, isUserRegulusOrAdmin } from '$lib/client/auth';
    import { type IRID } from '$lib/helpers/ir';
    import { detailIrUrl, iridUrl, relUrl } from '$lib/helpers/runes.svelte.js';
    import { type Translations } from '$lib/translations';
    import db, { type IR } from '$lib/data';
    import ServiceProtocols from './ServiceProtocols.svelte';
    import { cascadePumps } from '$lib/forms/IN/infoIN';
    import type { LanguageCode } from '$lib/languages';
    import { goto } from '$app/navigation';
    import ChangeIRID from './ChangeIRID.svelte';
    import { aA, aR } from '$lib/helpers/stores';
    import RKD from './RKD.svelte';

    const { t, ir, lang, irid }: {
        t: Translations, ir: IR, lang: LanguageCode, irid: IRID,
    } = $props();
    const td = $derived(t.detail);

    const remove = async () => {
        await db.deleteIR(irid!);
        await goto(iridUrl(`/detail?deleted`), { replaceState: true });
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
                {#if ir.evidence.ir.typ.first !== 'SOREL' && ir.evidence.ir.typ.first !== 'fve'}
                    <PDFLink name={t.nn.title} {t} link="NN" data={ir} {irid} />
                {/if}
                {#if ir.evidence.ir.chceVyplnitK.includes('heatPump')}
                    <PDFLink
                        disabled={!ir.uvedeniTC} name={t.tc.name} {t} link="UPT"
                        data={ir} {irid} additionalButton={{
                            href: iridUrl('/UPT'),
                            text: t.tc.commission,
                            important: true,
                        }}
                    />
                    {#each cascadePumps(ir.evidence) as tc}
                        <PDFLink name={t.zl.name(tc)} {t} link="ZL" data={ir} pump={tc.N} {irid} />
                    {/each}
                    {#each cascadePumps(ir.evidence) as tc}
                        <PDFLink
                            name={t.rk.name(tc)} {t} link="RK" data={ir} pump={tc.N} {irid}
                            disabled={!ir.kontrolyTC[tc.N]?.[1]} additionalButton={{
                                show: !ir.kontrolyTC[tc.N]?.[4],
                                href: iridUrl(`/RK?pump=${tc.N}`),
                                text: t.rk.fillOut(tc),
                            }} dropdownItems={$isUserAdmin ? ir.kontrolyTC[tc.N]?.keys().flatMap(y => [{
                                text: `${t.rk.year} ${y}`,
                            }, {
                                color: 'warning',
                                icon: 'edit_document',
                                text: td.editCheck + $aA,
                                href: iridUrl(`/RK/?pump=${tc.N}&edit-year=${y}`),
                            }]) : undefined}
                        />
                    {/each}
                {/if}
                {#if ir.evidence.ir.chceVyplnitK.includes('solarCollector')}
                    <PDFLink
                        disabled={!ir.uvedeniSOL}
                        name={t.sol.name} {t} link="UPS" data={ir} {irid} additionalButton={{
                            href: iridUrl('/UPS'),
                            text: t.sol.commission,
                            important: true,
                        }}
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
                <span class="material-icons">attach_email</span>
                {td.sendDocuments}
            </a>
            <a class="btn btn-primary" href={relUrl(`/IN?view-irid=${irid}`)}
               tabindex="0">
                <span class="material-icons">preview</span>
                {td.viewFilledData}
            </a>
        </div>
        <div class="d-flex flex-column gap-1 align-items-sm-start">
            {#if $isUserRegulusOrAdmin}
                <a tabindex="0" class="btn btn-info" href={iridUrl('/users')}>
                    <span class="material-icons">people</span>
                    {td.usersWithAccess}{$aR}
                </a>
            {/if}
            <ChangeIRID {ir} {irid} {t} />
            <a class="btn btn-warning" href={relUrl(`/IN?edit-irid=${irid}`)}
               tabindex="0">
                <span class="material-icons">edit_document</span>
                {td.editInstallationData}
            </a>
            <button class="btn btn-danger d-block"
                    data-bs-target="#deleteModal" data-bs-toggle="modal">
                <span class="material-icons">delete_forever</span>
                {td.deleteThisRecord}
            </button>

            <div aria-hidden="true" aria-labelledby="deleteModalLabel" class="modal fade" id="deleteModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="deleteModalLabel">{td.delete}</h1>
                            <button aria-label="Close" class="btn-close" data-bs-dismiss="modal" type="button"></button>
                        </div>
                        <div class="modal-body">
                            <span class="material-icons">delete_forever</span>
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

        <RKD {ir} {irid} {t} />
    </div>
</div>