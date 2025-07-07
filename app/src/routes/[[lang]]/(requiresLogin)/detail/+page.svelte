<script lang="ts">
    import { onMount, untrack } from 'svelte';
    import type { PageData } from './$types';
    import PDFLink from './PDFLink.svelte';
    import { checkAuth, isUserAdmin, isUserRegulusOrAdmin } from '$lib/client/auth';
    import { storable } from '$lib/helpers/stores';
    import { type FormUPT } from '$lib/forms/UPT/formUPT';
    import type { FirebaseError } from 'firebase/app';
    import { getIsOnline, startTechniciansListening } from '$lib/client/realtime';
    import { page } from '$app/state';
    import { type FormUPS } from '$lib/forms/UPS/formUPS';
    import { setTitle, withLoading } from '$lib/helpers/title.svelte.js';
    import {
        extractIRIDFromParts,
        type IRID,
        irWholeName,
        type SPID,
        spWholeName,
    } from '$lib/helpers/ir';
    import { ChooserWidget, InputWidget } from '$lib/forms/Widget.svelte.js';
    import type { Raw } from '$lib/forms/Form';
    import { detailIrUrl, iridUrl, relUrl, spidUrl } from '$lib/helpers/runes.svelte.js';
    import Widget from '$lib/components/Widget.svelte';
    import { todayISO } from '$lib/helpers/date';
    import NSP from '$lib/forms/NSP/infoNSP';
    import { p } from '$lib/translations';
    import db, { type IR } from '$lib/client/data';
    import type { FormNSP } from '$lib/forms/NSP/formNSP';
    import solarCollectorCommission from '$lib/forms/UPS/infoUPS';
    import heatPumpCommission from '$lib/forms/UPT/infoUPT';
    import ServiceProtocols from './ServiceProtocols.svelte';

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
    const t = data.translations;
    const irid = data.irid;
    const spid = data.spid;
    let originalSPID = $state() as SPID;

    const deleted = page.url.searchParams.has('deleted');
    const storedHeatPumpCommission = storable<Raw<FormUPT>>(`${heatPumpCommission.storeName}_${irid}`);
    const storedSolarCollectorCommission = storable<Raw<FormUPS>>(`${solarCollectorCommission.storeName}_${irid}`);

    let type: 'loading' | 'loaded' | 'noAccess' | 'offline' = $state('loading');
    let values = $state() as IR;
    let sp = $state() as Raw<FormNSP>;
    const fetchIRdata = async () => {
        const _values = await db.getIR(irid!);

        if (!_values) {
            type = 'noAccess';
            return false;
        }

        values = _values;
        return true;
    };
    onMount(withLoading(async () => {
        await checkAuth();
        await startTechniciansListening();

        try {
            if (irid) {
                if (!await fetchIRdata()) return;
            } else if (spid) {
                let _sp = await db.getIndependentProtocol(spid);

                if (!_sp) {
                    originalSPID = spid.split('-').slice(0, -1).join('-') as SPID;
                    _sp = await db.getIndependentProtocol(originalSPID);
                }

                if (!_sp) {
                    type = 'noAccess';
                    return;
                }
                sp = _sp;
            }
            type = 'loaded';
        } catch (e) {
            console.log((e as FirebaseError).code);
            if ((e as FirebaseError).code == 'unavailable' && !getIsOnline()) type = 'offline';
            else type = 'noAccess';
            return;
        }
        if ($storedHeatPumpCommission != undefined && values.uvedeniTC != undefined)
            storedHeatPumpCommission.set(undefined);
        if ($storedSolarCollectorCommission != undefined && values.uvedeniSOL != undefined)
            storedSolarCollectorCommission.set(undefined);
    }));

    const remove = async () => {
        await db.deleteIR(irid!);
        window.location.replace(iridUrl(`/detail?deleted`));
    };

    let change: 'no' | 'input' | 'sending' | 'fail' | 'unchanged' = $state('no');

    let irNumber = $state(new InputWidget({
        label: `serialNumber`,
        onError: `wrongNumberFormat`,
        regex: s => s ? /[0-9]{4}-[0-9]{2}-[0-9]{2}/ : /[A-Z][1-9OND] [0-9]{4}/,
        capitalize: true,
        maskOptions: s => ({
            mask: s ? `0000-00-00` : `A1 0000`,
            definitions: {
                A: /[A-Za-z]/,
                '1': /[1-9ONDond]/,
            },
        }),
        show: s => !s,
    }));
    let irType = $state(new ChooserWidget({
        label: `controllerType`,
        options: p(['IR RegulusBOX', 'IR RegulusHBOX', 'IR RegulusHBOX K', 'IR 34', 'IR 14', 'IR 12', 'SOREL']),
    }));

    $effect(() => {
        if (!values) return;
        untrack(() => {
            irNumber.setValue({}, values.evidence.ir.cislo);
            irType.setValue({}, values.evidence.ir.typ.first);
        });
    });
    $effect(() => {
        if (irType.value == p('SOREL')) {
            irNumber.setValue({}, todayISO());
        }
    });

    const s = $derived(irType.value?.includes('SOREL') ?? false);

    const changeController = async () => {
        try {
            irNumber.displayErrorVeto = true;
            irType.displayErrorVeto = true;
            if (irNumber.showError(s) || irType.showError(s)) return;
            const newNumber = irNumber.value;
            const newType = irType.value;
            change = 'sending';
            const record = (await db.getIR(irid!))!;
            record.evidence.ir.cislo = newNumber;
            if (record.evidence.ir.cislo == newNumber) return change = 'unchanged';
            record.evidence.ir.typ.first = newType;
            await db.newIR(record);
            const newRecord = await db.getIR(extractIRIDFromParts(newType!, newNumber));
            if (!newRecord?.evidence) return change = 'fail';
            await db.deleteIR(irid!);
            window.location.assign(detailIrUrl(extractIRIDFromParts(newType!, newNumber)));
        } catch (e) {
            console.log(e);
            change = 'fail';
        }
    };

    $effect(() => setTitle(spid ? 'Instalační a servisní protokol' : t.evidenceDetails));

    const newIRID = new InputWidget({
        label: p('IRID (z URL adresy)'),
    });
    const transfer = async () => {
        await db.addServiceProtocol(newIRID.value as IRID, {
            zasah: sp.zasah, fakturace: sp.fakturace, ukony: sp.ukony, nahradniDil1: sp.nahradniDil1,
            nahradniDil2: sp.nahradniDil2, nahradniDil3: sp.nahradniDil3, nahradniDil4: sp.nahradniDil4,
            nahradniDil5: sp.nahradniDil5, nahradniDil6: sp.nahradniDil6, nahradniDil7: sp.nahradniDil7,
            nahradniDil8: sp.nahradniDil8, nahradniDily: sp.nahradniDily,
        });
        window.location.replace(detailIrUrl(newIRID.value));
    };
</script>

{#if type === 'loaded'}
    <h3 class="m-0">{sp ? spWholeName(sp) : irWholeName(values.evidence)}</h3>
{:else if type !== 'loading'}
    <h3 class="m-0">
        {#if !irid}
            {spid?.replace('-', ' ').replace('-', '/').replace('-', '/').replaceAll('-', ':').replace(':', '-')}
        {:else if irid.length === 7}
            {irid.slice(1, 3)}
            {irid.slice(3, 7)}
        {:else if irid.length === 9}
            SOREL
        {/if}
    </h3>
{/if}
{#if deleted}
    <div class="alert alert-success" role="alert">
        {t.successfullyDeleted}
    </div>
{/if}
{#if type !== 'loaded' && type !== 'loading'}
    <div>{t.sorrySomethingWentWrong}</div>
    <div>
        {#if type === 'noAccess' && irid}
            {t.linkInvalid}
        {:else if type === 'noAccess' && spid}
            Buď protokol neexistuje nebo k němu nemáte přístup.
        {:else if type === 'offline'}
            {t.offline}
        {/if}
    </div>
{/if}
{#if type === 'loaded' && spid}
    <div class="d-flex flex-column gap-1 align-items-sm-start">
        <PDFLink lang={data.languageCode} {t} link="NSP" hideLanguageSelector={true} data={sp} />

        <a class="btn btn-warning" href={relUrl('/newSP')} onclick={() => {
            storable<typeof sp>(NSP.storeName).set(sp)
        }}>Vytvořit kopii protokolu</a>
    </div>

    {#if $isUserAdmin}
        <!--        <hr />-->
        <div class="d-flex flex-column gap-1 align-items-sm-start">
            <Widget widget={newIRID} {t} data={{}} />
            <button class="btn btn-danger d-block" onclick={transfer}>Převést protokol k IR (neodstraní se)</button>

            <button class="btn btn-danger d-block" onclick={() => {
                    db.deleteIndependentProtocol(originalSPID);
                    window.location.replace(spidUrl(`/detail?deleted`));
                }}
            >Odstranit protokol
            </button>
        </div>
    {/if}
{/if}
{#if type === 'loaded' && irid && irid.length !== 6}
    <div class="d-flex flex-column gap-1">
        {#if values.evidence.vzdalenyPristup.chce}
            <PDFLink name={t.regulusRouteForm} {t} link="RR" lang={data.languageCode} data={values} />
        {/if}
        {#if values.evidence.ir.typ.first !== p('SOREL')}
            <PDFLink name={t.routeGuide} {t} link="NN" lang={data.languageCode} data={values} />
        {/if}
        {#if values.evidence.ir.chceVyplnitK.includes('heatPump')}
            {#if values.evidence.tc.model2}
                <PDFLink name={t.warranty1} {t} link="ZL" lang={data.languageCode} data={values} pump={1} />
                <PDFLink name={t.warranty2} {t} link="ZL" lang={data.languageCode} data={values} pump={2} />
            {:else}
                <PDFLink name={t.warranty} {t} link="ZL" lang={data.languageCode} data={values} pump={1} />
            {/if}
            {#if values.evidence.tc.model3}
                <PDFLink name={t.warranty3} {t} link="ZL" lang={data.languageCode} data={values} pump={3} />
            {/if}
            {#if values.evidence.tc.model4}
                <PDFLink name={t.warranty4} {t} link="ZL" lang={data.languageCode} data={values} pump={4} />
            {/if}
            <PDFLink
                enabled={values.uvedeniTC !== undefined} name={t.heatPumpCommissionProtocol} {t} link="UPT"
                lang={data.languageCode} data={values}
            >
                {#if !values.uvedeniTC}
                    <a
                        tabindex="0"
                        class="btn btn-primary d-block"
                        href={iridUrl('/UTC')}
                    >{t.commission}</a>
                {/if}
            </PDFLink>
            <PDFLink name={!values.evidence.tc.model2 ? t.filledYearlyCheck : t.filledYearlyCheck1} {t} link="RK" pump={1}
                     lang={data.languageCode} data={values} enabled={values.kontrolyTC[1]?.[1] !== undefined}>
                <a
                    tabindex="0" href={iridUrl('/RK?tc=1')}
                    class="btn btn-primary d-block"
                >{!values.evidence.tc.model2 ? t.doYearlyCheck : t.doYearlyCheck1}</a>
            </PDFLink>
            {#if values.evidence.tc.model2}
                <PDFLink name={t.filledYearlyCheck2} {t} link="RK" lang={data.languageCode} data={values} pump={2}
                         enabled={values.kontrolyTC[2]?.[1] !== undefined}>
                    <a
                        tabindex="0" href={iridUrl('/RK?tc=2')}
                        class="btn btn-primary d-block"
                    >{t.doYearlyCheck2}</a>
                </PDFLink>
            {/if}
            {#if values.evidence.tc.model3}
                <PDFLink name={t.filledYearlyCheck3} {t} link="RK" lang={data.languageCode} data={values} pump={3}
                         enabled={values.kontrolyTC[3]?.[1] !== undefined}>
                    <a
                        tabindex="0" href={iridUrl('/RK?tc=3')}
                        class="btn btn-primary d-block"
                    >{t.doYearlyCheck3}</a>
                </PDFLink>
            {/if}
            {#if values.evidence.tc.model4}
                <PDFLink name={t.filledYearlyCheck4} {t} link="RK" lang={data.languageCode} data={values} pump={4}
                         enabled={values.kontrolyTC[4]?.[1] !== undefined}>
                    <a
                        tabindex="0" href={iridUrl('/RK?tc=4')}
                        class="btn btn-primary d-block"
                    >{t.doYearlyCheck4}</a>
                </PDFLink>
            {/if}
        {/if}
        {#if values.evidence.ir.chceVyplnitK.includes('solarCollector')}
            <PDFLink
                enabled={values.uvedeniSOL !== undefined}
                name={t.solarCollectorCommissionProtocol}
                {t}
                link="UPS"
                lang={data.languageCode} data={values}
            >
                {#if !values.uvedeniSOL}
                    <a
                        tabindex="0"
                        class="btn btn-info d-block"
                        href={iridUrl('/UPS')}
                    >{t.commission}</a>
                {/if}
            </PDFLink>
        {/if}
    </div>
    {#if $isUserRegulusOrAdmin}
        <ServiceProtocols {values} {t} lang={data.languageCode} {irid} />
    {/if}
    <div class="d-flex flex-column gap-1 align-items-sm-start">
        {#if $isUserRegulusOrAdmin}
            <a tabindex="0" class="btn btn-info" href={iridUrl('/users')}>
                Uživatelé s přístupem k této evidenci
            </a>
        {/if}
        {#if change === 'no'}
            <button class="btn btn-warning d-block" onclick={() => (change = 'input')}
            >{t.changeController}</button>
        {:else if change === 'input'}
            <div class="">
                <Widget bind:widget={irNumber} data={s} {t} />
                <Widget bind:widget={irType} data={s} {t} />
                <div class="btn-group">
                    <button class="btn btn-danger" onclick={changeController}>{t.confirm}</button>
                    <button class="btn btn-secondary" onclick={() => (change = 'no')}>{t.cancel}</button>
                </div>
            </div>
        {:else if change === 'sending'}
            <div class="d-flex align-items-center">
                <span>{t.saving}...</span>
                <div class="spinner-border text-danger"></div>
            </div>
        {:else if change === 'unchanged'}
            <p class="text-danger">{t.changeWentWrong}</p>
        {:else if change === 'fail'}
            <p class="text-danger">{t.changeWentWrong}</p>
        {/if}
        <a
            tabindex="0"
            class="btn btn-warning"
            href={relUrl(`/IN?edit-irid=${irid}`)}
            onclick={(e) => {
              e.preventDefault();
              window.location.href = relUrl(`/IN?edit-irid=${irid}`);
            }}>{t.editRegistration}</a
        >
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
{/if}