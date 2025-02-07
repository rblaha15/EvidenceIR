<script lang="ts">
    import { onMount } from 'svelte';
    import type { PageData } from './$types';
    import PdfLink from './PDFLink.svelte';
    import { checkAuth, isUserRegulusOrAdmin } from '$lib/client/auth';
    import { evidence, extractIRIDFromParts, extractIRIDFromRawData, type IR, novaEvidence, odstranitEvidenci } from '$lib/client/firestore';
    import { detailUrl, relUrl, storable } from '$lib/helpers/stores';
    import { heatPumpCommission, type UvedeniTC } from '$lib/forms/UvedeniTC';
    import type { FirebaseError } from 'firebase/app';
    import { getIsOnline, startTechniciansListening } from '$lib/client/realtime';
    import { addToHistory, removeFromHistory, removeFromHistoryByIRID } from '$lib/History';
    import { HistoryEntry } from '$lib/History.js';
    import { page } from '$app/state';
    import { solarCollectorCommission, type UvedeniSOL } from '$lib/forms/UvedeniSOL';
    import { setTitle } from '$lib/helpers/title.svelte';
    import { celyNazevIR } from '$lib/helpers/ir';
    import Input from '$lib/components/widgets/Input.svelte';
    import Chooser from '$lib/components/widgets/Chooser.svelte';
    import { p, InputWidget, ChooserWidget } from '$lib/Vec.svelte';
    import type { Raw } from '$lib/forms/Form';

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
    const t = data.translations;

    const deleted = page.url.searchParams.has('deleted');
    const storedHeatPumpCommission = storable<Raw<UvedeniTC>>(`${heatPumpCommission.storeName}_${data.irid}`);
    const storedSolarCollectorCommission = storable<Raw<UvedeniSOL>>(`${solarCollectorCommission.storeName}_${data.irid}`);

    let type: 'loading' | 'loaded' | 'noAccess' | 'offline' = $state('loading');
    let values = $state() as IR;
    const historyEntry = $derived(HistoryEntry(values.evidence));
    onMount(async () => {
        await checkAuth();
        await startTechniciansListening();

        try {
            const snapshot = (await (data.irid.length == 6 ? [
                evidence(`2${data.irid}`), evidence(`4${data.irid}`),
                evidence(`B${data.irid}`)
            ] : [evidence(data.irid)]).awaitAll()).find(snapshot => snapshot.exists());

            if (!snapshot) {
                type = 'noAccess';
                removeFromHistoryByIRID(data.irid);
                return;
            }
            values = snapshot.data();
            type = 'loaded';
        } catch (e) {
            console.log((e as FirebaseError).code);
            if ((e as FirebaseError).code == 'unavailable' && !getIsOnline()) type = 'offline';
            else {
                removeFromHistoryByIRID(data.irid);
                type = 'noAccess';
            }
            return;
        }
        if ($storedHeatPumpCommission != undefined && values.uvedeniTC != undefined)
            storedHeatPumpCommission.set(undefined);
        if ($storedSolarCollectorCommission != undefined && values.uvedeniSOL != undefined)
            storedSolarCollectorCommission.set(undefined);
        addToHistory(historyEntry);
    });

    const remove = async () => {
        removeFromHistory(historyEntry);
        await odstranitEvidenci(data.irid);
        window.location.replace(detailUrl(`?deleted`));
    };

    let change: 'no' | 'input' | 'sending' | 'fail' = $state('no');

    let irNumber = $state(new InputWidget({
        nazev: `newSerialNumber`, onError: `wrongNumberFormat`,
        regex: /([A-Z][1-9OND]) ([0-9]{4})/, capitalize: true,
        maskOptions: {
            mask: `A1 0000`,
            definitions: {
                A: /[A-Za-z]/,
                '1': /[1-9ONDond]/
            }
        },
    }));
    let irType = $state(new ChooserWidget({
        nazev: `controllerType`,
        options: [p`IR RegulusBOX`, p`IR RegulusHBOX`, p`IR RegulusHBOXK`, p`IR 14`, p`IR 12`],
    }));

    $effect(() => {
        if (!values) return;
        irNumber.value = values.evidence.ir.cislo;
        irType.value = values.evidence.ir.typ.first;
    });

    const changeController = async () => {
        irNumber.displayErrorVeto = true;
        irType.displayErrorVeto = true;
        if (irNumber.showError(undefined) || irType.showError(undefined)) return;
        const newNumber = irNumber.value;
        const newType = irType.value;
        change = 'sending';
        const record = (await evidence(data.irid)).data()!;
        record.evidence.ir.cislo = newNumber;
        record.evidence.ir.typ.first = newType;
        await novaEvidence(record);
        await odstranitEvidenci(data.irid);
        window.location.replace(relUrl(`/detail/${extractIRIDFromParts(newType!, newNumber)}`));
    };

    setTitle(t.evidenceDetails);
</script>

{#if type === 'loading'}
    <div class="spinner-border text-danger"></div>
{:else if type !== 'loaded'}
    <h3>
        {#if data.irid.length === 6}
            {data.irid.slice(0, 2)}
            {data.irid.slice(2, 6)}
        {:else}
            {data.irid.slice(1, 3)}
            {data.irid.slice(3, 7)}
        {/if}
    </h3>
{:else}
    <h3>{celyNazevIR(values.evidence)}</h3>
{/if}
{#if deleted}
    <div class="alert alert-success" role="alert">
        {t.successfullyDeleted}
    </div>
{/if}
{#if data.irid.length === 6}
    <div class="alert alert-warning" role="alert">
        Pozor! Toto je zastaralý odkaz.
        {#if values}
            {@const url = `/detail/${extractIRIDFromRawData(values.evidence)}`}
            Prosím, používejte <a target="_blank" href={url}>{page.url.origin + url}</a>
        {/if}
    </div>
{/if}
{#if type !== 'loaded' && type !== 'loading'}
    <p class="mt-3">{t.sorrySomethingWentWrong}</p>
    <p>
        {#if type === 'noAccess'}
            {t.linkInvalid}
        {:else if type === 'offline'}
            {t.offline}
        {/if}
    </p>
{/if}
{#if type === 'loaded' && data.irid.length !== 6}
    {#if values.evidence.vzdalenyPristup.chce}
        <PdfLink name={t.regulusRouteForm} {t} linkName="rroute" {data} />
    {/if}
    <PdfLink name={t.routeGuide} {t} linkName="guide" {data} />
    {#if values.evidence.ir.chceVyplnitK.includes('heatPump')}
        {#if (values.evidence.tc.model2 ?? 'noPump') === 'noPump'}
            <PdfLink name={t.warranty} {t} linkName="warranty-" {data} />
        {:else}
            <PdfLink name={t.warranty1} {t} linkName="warranty-" {data} />
            <PdfLink name={t.warranty2} {t} linkName="warranty-2" {data} />
        {/if}
        {#if (values.evidence.tc.model3 ?? 'noPump') !== 'noPump'}
            <PdfLink name={t.warranty3} {t} linkName="warranty-3" {data} />
        {/if}
        {#if (values.evidence.tc.model4 ?? 'noPump') !== 'noPump'}
            <PdfLink name={t.warranty4} {t} linkName="warranty-4" {data} />
        {/if}
        <PdfLink
            enabled={values.uvedeniTC !== undefined}
            name={t.heatPumpCommissionProtocol}
            {t}
            linkName="heatPumpCommissionProtocol"
            {data}
        >
            {#if !values.uvedeniTC}
                <button
                    class="btn btn-outline-info d-block mt-2 mt-sm-0 ms-sm-2"
                    onclick={() => (window.location.href = detailUrl('/heatPumpCommission'))}
                >{t.commission}</button
                >
            {/if}
        </PdfLink>
        <PdfLink name={t.filledYearlyCheck} {t} linkName="check" {data}>
            <button
                class="btn btn-outline-info d-block mt-2 mt-sm-0 ms-sm-2"
                onclick={() => (window.location.href = detailUrl('/check'))}
            >{t.doYearlyCheck}</button
            >
        </PdfLink>
    {/if}
    {#if values.evidence.ir.chceVyplnitK.includes('solarCollector')}
        <PdfLink
            enabled={values.uvedeniSOL !== undefined}
            name={t.solarCollectorCommissionProtocol}
            {t}
            linkName="solarCollectorCommissionProtocol"
            {data}
        >
            {#if !values.uvedeniSOL}
                <button
                    class="btn btn-outline-info d-block mt-2 mt-sm-0 ms-sm-2"
                    onclick={() => (window.location.href = detailUrl('/solarCollectorCommission'))}
                >{t.commission}</button
                >
            {/if}
        </PdfLink>
    {/if}
    {#if $isUserRegulusOrAdmin}
        <hr />
        <h4 class="mt-2">Protokoly servisního zásahu</h4>
        {#each values.installationProtocols as p, i}
            {@const datum = p.zasah.datum.split('T')[0].split('-').join('/')}
            {@const hodina = p.zasah.datum.split('T')[1].split(':')[0]}
            {@const technik = p.zasah.inicialy}
            <PdfLink name="{technik} {datum}-{hodina}" {data} {t} linkName="installationProtocol-{i}" hideLanguageSelector={true} >
                <button
                    class="btn btn-outline-info d-block mt-2 mt-sm-0 ms-sm-2"
                    onclick={() => (window.location.href = detailUrl(`/sp/?edit=${i}`))}
                >Upravit protokol</button>
            </PdfLink>
        {/each}
        <button class="btn btn-outline-info d-block mt-2"
                onclick={() => window.location.href = detailUrl('/sp')}
        >Vyplnit protokol
        </button>
    {/if}
    <hr />
    {#if $isUserRegulusOrAdmin}
        <a class="btn btn-outline-info mt-2" href={detailUrl('/users')}>
            Uživatelé s přístupem k této evidenci
        </a>
    {/if}
    {#if change === 'no'}
        <button class="btn btn-outline-warning d-block mt-2" onclick={() => (change = 'input')}
        >{t.changeController}</button
        >
    {:else if change === 'input'}
        <div class="mt-2">
            <Input bind:vec={irNumber} data={undefined} {t} />
            <Chooser bind:vec={irType} data={undefined} {t} />
            <div class="btn-group">
                <button class="btn btn-danger" onclick={changeController}>{t.confirm}</button>
                <button class="btn btn-outline-secondary" onclick={() => (change = 'no')}>{t.cancel}</button>
            </div>
        </div>
    {:else if change === 'sending'}
        <div class="d-flex align-items-center mt-2">
            <span>{t.saving}...</span>
            <div class="spinner-border text-danger ms-2"></div>
        </div>
    {:else if change === 'fail'}
        <p class="mt-2 text-danger">{t.changeWentWrong}</p>
    {/if}
    <a
        class="btn btn-outline-warning mt-2"
        href={relUrl(`/new?edit-irid=${data.irid}`)}
        onclick={(e) => {
			e.preventDefault();
			window.location.href = relUrl(`/new?edit-irid=${data.irid}`);
		}}>{t.editRegistration}</a
    >
    <button class="btn btn-outline-danger d-block mt-2"
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
                    <button type="button" class="btn btn-outline-primary" data-bs-dismiss="modal">Zrušit</button>
                    <button type="button" class="btn btn-danger" onclick={remove}>Odstranit</button>
                </div>
            </div>
        </div>
    </div>
{/if}