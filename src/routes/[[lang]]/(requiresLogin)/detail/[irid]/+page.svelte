<script lang="ts">
    import { onMount, untrack } from 'svelte';
    import type { PageData } from './$types';
    import PdfLink from './PDFLink.svelte';
    import { checkAuth, currentUser, isUserAdmin, isUserRegulusOrAdmin } from '$lib/client/auth';
    import { storable } from '$lib/helpers/stores';
    import { heatPumpCommission, type UvedeniTC } from '$lib/forms/UvedeniTC';
    import type { FirebaseError } from 'firebase/app';
    import { getIsOnline, startTechniciansListening, techniciansList } from '$lib/client/realtime';
    import { page } from '$app/state';
    import { solarCollectorCommission, type UvedeniSOL } from '$lib/forms/UvedeniSOL';
    import { setTitle } from '$lib/helpers/title.svelte';
    import {
        extractIRIDFromParts,
        extractIRIDFromRawData,
        type IRID,
        irWholeName,
        isIRID,
        isSPID,
        type SPID,
        spName,
        spWholeName,
    } from '$lib/helpers/ir';
    import { ChooserWidget, InputWidget } from '$lib/Widget.svelte.js';
    import type { Raw } from '$lib/forms/Form';
    import { detailUrl, relUrl } from '$lib/helpers/runes.svelte';
    import Widget from '$lib/components/Widget.svelte';
    import { todayISO } from '$lib/helpers/date';
    import sp2, { type DataSP2 } from '$lib/forms/SP2';
    import { p, plainArray } from '$lib/translations';
    import db, { type IR } from '$lib/client/data';

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
    const t = data.translations;
    const irid = isIRID(data.id) ? data.id : undefined;
    const spid = isSPID(data.id) ? data.id : undefined;

    const deleted = page.url.searchParams.has('deleted');
    const storedHeatPumpCommission = storable<Raw<UvedeniTC>>(`${heatPumpCommission.storeName}_${irid}`);
    const storedSolarCollectorCommission = storable<Raw<UvedeniSOL>>(`${solarCollectorCommission.storeName}_${irid}`);

    let type: 'loading' | 'loaded' | 'noAccess' | 'offline' = $state('loading');
    let values = $state() as IR;
    let sp = $state() as Raw<DataSP2>;
    const fetchIRdata = async () => {
        const _values = (await (irid!.length == 6 ? [
            db.getIR(`2${irid}`), db.getIR(`4${irid}`),
            db.getIR(`B${irid}`),
        ] : [db.getIR(irid!)]).awaitAll()).find(Boolean);

        if (!_values) {
            type = 'noAccess';
            return false;
        }

        values = _values;
        return true;
    };
    onMount(async () => {
        await checkAuth();
        await startTechniciansListening();

        try {
            if (irid) {
                if (!await fetchIRdata()) return;
            } else if (spid) {
                let _sp = await db.getIndependentProtocol(spid);

                if (!_sp) {
                    _sp = await db.getIndependentProtocol(spid.split('-').slice(0, -1).join('-') as SPID);
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
    });

    const remove = async () => {
        await db.deleteIR(irid!);
        window.location.replace(detailUrl(`?deleted`));
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
        options: plainArray(['IR RegulusBOX', 'IR RegulusHBOX', 'IR RegulusHBOX K', 'IR 34', 'IR 14', 'IR 12', 'SOREL']),
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
            window.location.assign(relUrl(`/detail/${extractIRIDFromParts(newType!, newNumber)}`));
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
        window.location.replace(relUrl(`/detail/${newIRID.value}`));
    };
    const copySP = (i: number) => async () => {
        const ja = $techniciansList.find(t => $currentUser?.email == t.email);
        const p = values.installationProtocols[i];
        await db.addServiceProtocol(irid!, {
            ...p,
            fakturace: {
                hotove: 'doNotInvoice',
                komu: null,
                jak: null,
            },
            zasah: {
                ...p.zasah,
                clovek: ja?.name ?? p.zasah.clovek,
                inicialy: ja?.initials ?? p.zasah.inicialy,
            },
        });
        await fetchIRdata();
    };
</script>

{#if type === 'loading'}
    <div class="spinner-border text-danger"></div>
{:else if type !== 'loaded'}
    <h3 class="m-0">
        {#if !irid}
            {spid?.replace('-', ' ').replace('-', '/').replace('-', '/').replaceAll('-', ':').replace(':', '-')}
        {:else if irid.length === 6}
            {irid.slice(0, 2)}
            {irid.slice(2, 6)}
        {:else if irid.length === 7}
            {irid.slice(1, 3)}
            {irid.slice(3, 7)}
        {:else if irid.length === 9}
            SOREL
        {/if}
    </h3>
{:else}
    <h3 class="m-0">{sp ? spWholeName(sp) : irWholeName(values.evidence)}</h3>
{/if}
{#if deleted}
    <div class="alert alert-success" role="alert">
        {t.successfullyDeleted}
    </div>
{/if}
{#if irid && irid.length === 6}
    <div class="alert alert-warning" role="alert">
        Pozor! Toto je zastaralý odkaz.
        {#if values}
            {@const url = `/detail/${extractIRIDFromRawData(values.evidence)}`}
            Prosím, používejte <a target="_blank" href={url}>{page.url.origin + url}</a>
        {/if}
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
        <PdfLink lang={data.languageCode} id={spid} {t} linkName="publicInstallationProtocol" hideLanguageSelector={true} data={sp} />

        <a class="btn btn-warning" href={relUrl('/newSP')} onclick={() => {
            storable<typeof sp>(sp2.storeName).set(sp)
        }}>Vytvořit kopii protokolu</a>
    </div>

    {#if $isUserAdmin}
        <!--        <hr />-->
        <div class="d-flex flex-column gap-1 align-items-sm-start">
            <Widget widget={newIRID} {t} data={{}} />
            <button class="btn btn-danger d-block" onclick={transfer}>Převést protokol k IR</button>

            <button class="btn btn-danger d-block"
                    onclick={() => db.deleteIndependentProtocol(spid)}
            >Odstranit protokol
            </button>
        </div>
    {/if}
{/if}
{#if type === 'loaded' && irid && irid.length !== 6}
    <div class="d-flex flex-column gap-1">
        {#if values.evidence.vzdalenyPristup.chce}
            <PdfLink name={t.regulusRouteForm} {t} linkName="rroute" lang={data.languageCode} id={irid} data={values} />
        {/if}
        {#if values.evidence.ir.typ.first !== p('SOREL')}
            <PdfLink name={t.routeGuide} {t} linkName="guide" lang={data.languageCode} id={irid} data={values} />
        {/if}
        {#if values.evidence.ir.chceVyplnitK.includes('heatPump')}
            {#if values.evidence.tc.model2}
                <PdfLink name={t.warranty1} {t} linkName="warranty-" lang={data.languageCode} id={irid} data={values} />
                <PdfLink name={t.warranty2} {t} linkName="warranty-2" lang={data.languageCode} id={irid} data={values} />
            {:else}
                <PdfLink name={t.warranty} {t} linkName="warranty-" lang={data.languageCode} id={irid} data={values} />
            {/if}
            {#if values.evidence.tc.model3}
                <PdfLink name={t.warranty3} {t} linkName="warranty-3" lang={data.languageCode} id={irid} data={values} />
            {/if}
            {#if values.evidence.tc.model4}
                <PdfLink name={t.warranty4} {t} linkName="warranty-4" lang={data.languageCode} id={irid} data={values} />
            {/if}
            <PdfLink
                enabled={values.uvedeniTC !== undefined} name={t.heatPumpCommissionProtocol} {t} linkName="heatPumpCommissionProtocol"
                lang={data.languageCode} id={irid} data={values}
            >
                {#if !values.uvedeniTC}
                    <a
                        tabindex="0"
                        class="btn btn-primary d-block"
                        href={detailUrl('/heatPumpCommission')}
                    >{t.commission}</a>
                {/if}
            </PdfLink>
            <PdfLink name={!values.evidence.tc.model2 ? t.filledYearlyCheck : t.filledYearlyCheck1} {t} linkName="check-1"
                     lang={data.languageCode} id={irid} data={values} enabled={values.kontrolyTC[1]?.[1] !== undefined}>
                <a
                    tabindex="0" href={detailUrl('/check?tc=1')}
                    class="btn btn-primary d-block"
                >{!values.evidence.tc.model2 ? t.doYearlyCheck : t.doYearlyCheck1}</a>
            </PdfLink>
            {#if values.evidence.tc.model2}
                <PdfLink name={t.filledYearlyCheck2} {t} linkName="check-2" lang={data.languageCode} id={irid} data={values}
                         enabled={values.kontrolyTC[2]?.[1] !== undefined}>
                    <a
                        tabindex="0" href={detailUrl('/check?tc=2')}
                        class="btn btn-primary d-block"
                    >{t.doYearlyCheck2}</a>
                </PdfLink>
            {/if}
            {#if values.evidence.tc.model3}
                <PdfLink name={t.filledYearlyCheck3} {t} linkName="check-3" lang={data.languageCode} id={irid} data={values}
                         enabled={values.kontrolyTC[3]?.[1] !== undefined}>
                    <a
                        tabindex="0" href={detailUrl('/check?tc=3')}
                        class="btn btn-primary d-block"
                    >{t.doYearlyCheck3}</a>
                </PdfLink>
            {/if}
            {#if values.evidence.tc.model4}
                <PdfLink name={t.filledYearlyCheck4} {t} linkName="check-4" lang={data.languageCode} id={irid} data={values}
                         enabled={values.kontrolyTC[4]?.[1] !== undefined}>
                    <a
                        tabindex="0" href={detailUrl('/check?tc=4')}
                        class="btn btn-primary d-block"
                    >{t.doYearlyCheck4}</a>
                </PdfLink>
            {/if}
        {/if}
        {#if values.evidence.ir.chceVyplnitK.includes('solarCollector')}
            <PdfLink
                enabled={values.uvedeniSOL !== undefined}
                name={t.solarCollectorCommissionProtocol}
                {t}
                linkName="solarCollectorCommissionProtocol"
                lang={data.languageCode} id={irid} data={values}
            >
                {#if !values.uvedeniSOL}
                    <a
                        tabindex="0"
                        class="btn btn-info d-block"
                        href={detailUrl('/solarCollectorCommission')}
                    >{t.commission}</a>
                {/if}
            </PdfLink>
        {/if}
    </div>
    {#if $isUserRegulusOrAdmin}
        <h4 class="m-0">Protokoly servisního zásahu</h4>
        {#if values.installationProtocols.length}
            <div class="d-flex flex-column gap-1 align-items-sm-start">
                {#each values.installationProtocols as p, i}
                    <PdfLink name={spName(p.zasah)} lang={data.languageCode} id={irid} data={values} {t} linkName="installationProtocol-{i}"
                             hideLanguageSelector={true}
                             breakpoint="md">
                        <a tabindex="0" class="btn btn-warning d-block" href={detailUrl(`/sp/?edit=${i}`)}>
                            Upravit protokol
                        </a>
                        <button class="btn btn-warning d-block" data-bs-toggle="modal" data-bs-target="#duplicateModal">
                            Duplikovat
                        </button>
                    </PdfLink>

                    <div class="modal fade" id="duplicateModal" tabindex="-1" aria-labelledby="duplicateModalLabel" aria-hidden="true">
                        <div class="modal-dialog">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h1 class="modal-title fs-5" id="duplicateModalLabel">Duplikovat</h1>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body">
                                    Chcete vytvořit kopii pro vykázání servisního zásahu více osob?
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Ne</button>
                                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal" onclick={copySP(i)}>Ano</button>
                                </div>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
        <div class="d-flex flex-column gap-1 align-items-sm-start">
            <a class="btn btn-primary" tabindex="0" href={detailUrl('/sp')}>
                Vyplnit {values.installationProtocols.length ? 'další ' : ''} protokol
            </a>
        </div>
    {/if}
    <div class="d-flex flex-column gap-1 align-items-sm-start">
        {#if $isUserRegulusOrAdmin}
            <a tabindex="0" class="btn btn-info" href={detailUrl('/users')}>
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
            href={relUrl(`/new?edit-irid=${irid}`)}
            onclick={(e) => {
              e.preventDefault();
              window.location.href = relUrl(`/new?edit-irid=${irid}`);
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