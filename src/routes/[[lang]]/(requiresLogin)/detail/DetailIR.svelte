<script lang="ts">
    import PDFLink from './PDFLink.svelte';
    import { isUserRegulusOrAdmin } from '$lib/client/auth';
    import { type IRID } from '$lib/helpers/ir';
    import { detailIrUrl, iridUrl, relUrl } from '$lib/helpers/runes.svelte.js';
    import { p, type Translations } from '$lib/translations';
    import db, { type IR } from '$lib/client/data';
    import ServiceProtocols from './ServiceProtocols.svelte';
    import { cascadePumps } from '$lib/forms/IN/infoIN';
    import type { LanguageCode } from '$lib/languages';
    import { goto } from '$app/navigation';
    import ChangeIRID from './ChangeIRID.svelte';

    const {
        t, ir, lang, irid,
    }: {
        t: Translations, ir: IR, lang: LanguageCode, irid: IRID,
    } = $props()

    const remove = async () => {
        await db.deleteIR(irid!);
        await goto(iridUrl(`/detail?deleted`), { replaceState: true });
    };
</script>

<div class="d-flex flex-column gap-1 align-items-sm-start">
        <a class="btn btn-primary" tabindex="0"
           href={relUrl(`/OD?redirect=${detailIrUrl()}&user=${ir.evidence.koncovyUzivatel.email}`)}>
            {t.sendDocuments}
        </a>
        <a class="btn btn-primary" tabindex="0"
           href={relUrl(`/IN?view-irid=${irid}`)}>
            {t.viewInfo}
        </a>
    </div>
    <div class="d-flex flex-column gap-1">
        {#if ir.evidence.vzdalenyPristup.chce}
            <PDFLink name={t.regulusRouteForm} {t} link="RR" {lang} data={ir} {irid} />
        {/if}
        {#if ir.evidence.ir.typ.first !== p('SOREL') && ir.evidence.ir.typ.first !== 'irFVE'}
            <PDFLink name={t.routeGuide} {t} link="NN" {lang} data={ir} {irid} />
        {/if}
        {#if ir.evidence.ir.chceVyplnitK.includes('heatPump')}
            {#each cascadePumps(ir.evidence, t) as tc}
                <PDFLink name={t.warrantyNr(tc)} {t} link="ZL" {lang} data={ir} pump={tc.N} {irid} />
            {/each}
            <PDFLink
                enabled={ir.uvedeniTC !== undefined} name={t.heatPumpCommissionProtocol} {t} link="UPT"
                {lang} data={ir} {irid}
            >
                {#if !ir.uvedeniTC}
                    <a
                        tabindex="0"
                        class="btn btn-primary d-block"
                        href={iridUrl('/UPT')}
                    >{t.commission}</a>
                {/if}
            </PDFLink>
            {#each cascadePumps(ir.evidence, t) as tc}
                <PDFLink name={t.filledYearlyCheckNr(tc)} {t} link="RK" {lang} data={ir} pump={tc.N}
                         enabled={ir.kontrolyTC[tc.N]?.[1] !== undefined} {irid}>
                    {#if !ir.kontrolyTC[tc.N]?.[4]}
                        <a
                            tabindex="0" href={iridUrl(`/RK?tc=${tc.N}`)}
                            class="btn btn-primary d-block"
                        >{t.doYearlyCheckNr(tc)}</a>
                    {/if}
                </PDFLink>
            {/each}
        {/if}
        {#if ir.evidence.ir.chceVyplnitK.includes('solarCollector')}
            <PDFLink
                enabled={ir.uvedeniSOL !== undefined}
                name={t.solarCollectorCommissionProtocol}
                {t}
                link="UPS"
                {lang} data={ir} {irid}
            >
                {#if !ir.uvedeniSOL}
                    <a
                        tabindex="0"
                        class="btn btn-primary d-block"
                        href={iridUrl('/UPS')}
                    >{t.commission}</a>
                {/if}
            </PDFLink>
        {/if}
        {#if ir.evidence.ir.chceVyplnitK.includes('photovoltaicPowerPlant')}
            <PDFLink
                enabled={ir.uvedeniFVE !== undefined}
                name={t.photovoltaicSystemCommissionProtocol}
                {t}
                link="UPF"
                {lang} data={ir} {irid}
            >
                {#if !ir.uvedeniFVE}
                    <a
                        tabindex="0"
                        class="btn btn-primary d-block"
                        href={iridUrl('/UPF')}
                    >{t.commission}</a>
                {/if}
            </PDFLink>
        {/if}
        {#if ir.evidence.ir.typ.first === p('IR 14') && ir.evidence.ir.typ.second === p('CTC')}
            <PDFLink name={t.ft.title} {t} link="FT" {lang} data={ir} {irid} enabled={Boolean(ir.faceTable)}>
                {#if !ir.faceTable}
                    <a
                        tabindex="0"
                        class="btn btn-primary d-block"
                        href={iridUrl('/FT')}
                    >{t.ft.setUp}</a>
                {/if}
            </PDFLink>
        {/if}
    </div>
    {#if isUserRegulusOrAdmin}
        <ServiceProtocols {ir} {t} {lang} {irid} />
    {/if}
    <div class="d-flex flex-column gap-1 align-items-sm-start">
        {#if $isUserRegulusOrAdmin}
            <a tabindex="0" class="btn btn-info" href={iridUrl('/users')}>
                Uživatelé s přístupem k této evidenci
            </a>
        {/if}
        <ChangeIRID {t} {irid} {ir} />
        <a class="btn btn-warning" tabindex="0"
           href={relUrl(`/IN?edit-irid=${irid}`)}>
            {t.editRegistration}
        </a>
        <button class="btn btn-danger d-block"
                data-bs-toggle="modal" data-bs-target="#deleteModal"
        >{t.deleteThisEvidence}</button>

        <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h1 class="modal-title fs-5" id="deleteModalLabel">Odstranit</h1>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        Opravdu chcete odstranit evidenci instalace?
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Zrušit</button>
                        <button type="button" class="btn btn-danger" onclick={remove}>Odstranit</button>
                    </div>
                </div>
            </div>
        </div>
    </div>