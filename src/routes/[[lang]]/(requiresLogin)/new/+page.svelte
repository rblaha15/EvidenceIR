<script lang="ts">
    import WidgetComponent from '$lib/components/Widget.svelte';
    import Scanner from '$lib/components/Scanner.svelte';

    import * as v from '$lib/Widget.svelte.js';
    import { p } from '$lib/Widget.svelte.js';
    import { type Data, importData, newData, type UDDA } from '$lib/forms/Data';
    import { responsiblePerson, startTechniciansListening, techniciansList } from '$lib/client/realtime';
    import { companies } from '$lib/helpers/companies';
    import send from './send.svelte';
    import { evidence, type IRID } from '$lib/client/firestore';
    import { storable } from '$lib/helpers/stores';

    import { dev } from '$app/environment';
    import { page } from '$app/state';
    import { onMount, untrack } from 'svelte';
    import { nazevFirmy, regulusCRN } from '$lib/helpers/ares';
    import FormHeader from '$lib/forms/FormHeader.svelte';
    import { isUserRegulusOrAdmin } from '$lib/client/auth';
    import { formaSpolecnostiJeSpatne, typBOX } from '$lib/helpers/ir';
    import { dataToRawData, type Raw, rawDataToData } from '$lib/forms/Form';
    import defaultData from '$lib/forms/defaultData';
    import { todayISO } from '$lib/helpers/date';

    const t = page.data.translations;

    const storedData = storable<Raw<Data>>(`stored_data`);

    let mode: 'loading' | 'create' | 'edit' | 'createStored' = $state('loading');
    let data: Data = $state(newData());
    const d: UDDA = $derived({ d: data });
    onMount(async () => {
        await startTechniciansListening();

        const irid = page.url.searchParams.get('edit-irid') as IRID | null;
        if (irid) {
            const snapshot = await evidence(irid);
            console.log(snapshot);
            if (snapshot.exists() && snapshot.data() != undefined) {
                data = rawDataToData(data, snapshot.data()!.evidence);
                data.ir.cislo.lock = () => true;
                data.ir.typ.lock1 = () => true;
                return (mode = 'edit');
            }
        }
        const stored = $storedData;
        if (stored == undefined) {
            return (mode = 'create');
        } else {
            data = rawDataToData(data, stored);
            return (mode = 'createStored');
        }
    });
    $effect(() => {
        if (!page.url.searchParams.has('edit-irid') && mode == 'edit') {
            location.reload();
        }
    });

    $effect(() => {
        data;
        if (mode != 'loading') {
            data.ostatni.zodpovednaOsoba.show = () => $responsiblePerson == null;
            if ($responsiblePerson != null) data.ostatni.zodpovednaOsoba.setValue(data, $responsiblePerson);
        }
    });
    $effect(() => {
        data;
        if (mode != 'loading') {
            if (data.ir.typ.value.first == p`IR 12`) {
                data.ir.typ.mutateValue(data, v => ({ ...v, second: p`CTC` }));
            }
        }
    });
    $effect(() => {
        data;
        if (mode != 'loading') {
            if (!data.tc.model.options(d).includes(data.tc.model.value ?? '')) {
                data.tc.model.setValue(data, null);
            }
        }
    });
    $effect(() => {
        data;
        if (mode != 'loading') {
            if (data.ir.typ.value.second == p`RTC`) {
                data.tc.typ.setValue(data, 'airToWater');
            }
        }
    });
    $effect(() => {
        data;
        if (mode != 'loading') {
            if (data.ir.typ.value.first == p`SOREL`) {
                data.ir.cislo.setValue(data, todayISO());
            }
        }
    });
    $effect(() => {
        if (mode != 'loading' && mode != 'edit') {
            const raw = dataToRawData(data);
            if (data.uvedeni.jakoMontazka.value) {
                raw.uvedeni.ico = raw.montazka.ico;
                raw.uvedeni.email = raw.montazka.email;
                raw.uvedeni.telefon = raw.montazka.telefon;
            } else if (raw.uvedeni.ico == regulusCRN.toString() && data.uvedeni.regulus.value) {
                raw.uvedeni.email = data.uvedeni.regulus.value.email;
                raw.uvedeni.telefon = data.uvedeni.regulus.value.phone;
                raw.uvedeni.zastupce = data.uvedeni.regulus.value.name;
            }
            if (data.mistoRealizace.jakoBydliste.value) {
                raw.mistoRealizace.ulice = raw.bydliste.ulice;
                raw.mistoRealizace.obec = raw.bydliste.obec;
                raw.mistoRealizace.psc = raw.bydliste.psc;
            }
            storedData.set(raw);
        }
    });

    let chosen = $derived(
        data && mode != 'loading'
            ? {
                assemblyCompany: nazevFirmy(data.montazka.ico.value),
                commissioningCompany: nazevFirmy(data.uvedeni.ico.value)
            }
            : undefined
    );

    let list = $derived(
        data && mode != 'loading'
            ? (Object.values(data) as Data[keyof Data][]).flatMap(
                (obj) => Object.values(obj) as v.Widget<UDDA, Data>[]
            )
            : []
    );

    let result = $state({
        text: '',
        red: false,
        load: false
    });
    let doNotSend = $state(false);

    const cisla = $derived([data.tc.cislo, data.tc.cislo2, data.tc.cislo3, data.tc.cislo4]);

    $effect(() => {
        data.uvedeni.company.items = () => $companies.commissioningCompanies;
        data.montazka.company.items = () => $companies.assemblyCompanies;
    });
    $effect(() => {
        data.uvedeni.regulus.items = () => $techniciansList;
    });
    $effect(() => {
        data.vzdalenyPristup.plati.options = () => $isUserRegulusOrAdmin
            ? ['assemblyCompany', 'endCustomer', 'doNotInvoice', p`Později, dle protokolu`]
            : ['assemblyCompany', 'endCustomer'];
    });
    const onImport = (newData: Raw<Data>) => {
        console.log(newData);
        data = rawDataToData(data, newData);
        for (const i in list) {
            list[i].displayErrorVeto = true;
        }
    };

    const isDangerous = $derived(JSON.stringify(dataToRawData(data)) != JSON.stringify(dataToRawData(untrack(newData))));
</script>

<FormHeader importData={{...importData, onImport, isDangerous}} showResetButton={mode === 'create' || mode === 'createStored'} store={storedData}
            {t}
            title={mode === 'edit' ? t.editation : t.controllerRegistration} />

{#each list as _, i}
    {#if list[i] instanceof v.InputWidget && cisla.includes(list[i]) && list[i].show(d)}
        <Scanner
            bind:widget={list[i]}
            onScan={(text) => list[i].setValue(data, text.slice(-12))}
            {t} {d} f={data}
        />
    {:else}
        <WidgetComponent bind:widget={list[i]} {t} data={d} form={data} />
    {/if}
    {#if list[i] === data.montazka.ico && list[i].show(d)}
        <p>
            {#await chosen?.assemblyCompany then a}
                {#if a}
                    {t.chosenCompany}: {a}
                {/if}
            {/await}
        </p>
    {/if}
    {#if list[i] === data.uvedeni.ico && list[i].show(d)}
        <p>
            {#await chosen?.commissioningCompany then c}
                {#if c}
                    {t.chosenCompany}: {c}
                {/if}
            {/await}
        </p>
    {/if}
{/each}

{#if dev}
    <div class="form-check">
        <p>
            <label class="form-check-label">
                <input class="form-check-input" type="checkbox" bind:checked={doNotSend} />
                Neodesílat emaily
            </label>
        </p>
    </div>
{/if}

<div class="d-inline-flex flex-sm-row flex-column align-content-center">
    <div class="d-inline-flex align-content-center text-break">
        {#if !result.load}
            <button
                type="button"
                class="btn btn-success"
                onclick={() => send({
                    data, progress: v => result = v,
                    doNotSend: doNotSend || (mode === 'edit' && !dev),
                    editMode: mode === 'edit',
                    showError: () => {
                        for (const i in list) {
                            list[i].displayErrorVeto = true;
                        }
                    }
                })}
            >{t.save}</button>
        {/if}
        {#if !result.load && mode === 'edit'}
            <button
                type="button"
                class="btn btn-warning ms-2"
                onclick={() => send({
                    data, progress: v => result = v,
                    doNotSend, editMode: true,
                    showError: () => {
                        for (const i in list) {
                            list[i].displayErrorVeto = true;
                        }
                    }
                })}
            >{t.saveAndSend}</button>
        {/if}
        {#if mode === 'edit'}
            <button type="button" class="btn btn-secondary ms-2" onclick={() => history.back()}>
                {t.back}
            </button>
        {/if}
    </div>

    <div class="d-inline-flex align-content-center text-break mt-2 mt-sm-0">
        {#if result.load}
            <div class="spinner-border text-danger ms-2"></div>
        {/if}
        <p class="ms-2 my-auto" class:text-danger={result.red}>{@html result.text}</p>
    </div>
</div>
