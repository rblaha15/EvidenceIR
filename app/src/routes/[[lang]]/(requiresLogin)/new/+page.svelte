<script lang="ts">
    import VecComponent from '$lib/components/Vec.svelte';
    import Scanner from '$lib/components/Scanner.svelte';

    import * as v from '$lib/Vec.svelte';
    import { p } from '$lib/Vec.svelte';
    import { type Data, dataToRawData, newData, type RawData, rawDataToData } from '$lib/Data';
    import { responsiblePerson, startTechniciansListening, techniciansList } from '$lib/client/realtime';
    import { companies } from './companies';
    import odeslat from './odeslat.svelte';
    import { evidence, type IRID } from '$lib/client/firestore';
    import { storable } from '$lib/helpers/stores';

    import { dev } from '$app/environment';
    import { page } from '$app/state';
    import { onMount } from 'svelte';
    import { nazevFirmy } from '$lib/helpers/ares';
    import FormHeader from '../detail/[irid]/FormHeader.svelte';
    import { isUserRegulusOrAdmin } from '$lib/client/auth';
    import { formaSpolecnostiJeSpatne, typBOX } from '$lib/helpers/ir';

    const t = page.data.translations;

    const storedData = storable<RawData>(`stored_data`);

    let mode: 'loading' | 'create' | 'edit' | 'createStored' = $state('loading');
    let data: Data = $state(newData());
    onMount(async () => {
        await startTechniciansListening()

        const irid = page.url.searchParams.get('edit') as IRID | null;
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
        if (!page.url.searchParams.has('edit') && mode == 'edit') {
            location.reload();
        }
    });

    $effect(() => {
        data;
        if (mode != 'loading') {
            data.ostatni.zodpovednaOsoba.zobrazit = () => $responsiblePerson == null;
            if ($responsiblePerson != null) data.ostatni.zodpovednaOsoba.value = $responsiblePerson;
        }
    });
    $effect(() => {
        data;
        if (mode != 'loading') {
            if (data.uvedeni.jakoMontazka.value) {
                data.uvedeni.ico.value = '';
                data.uvedeni.email.value = '';
                data.uvedeni.telefon.value = '';
            } else if (
                data.uvedeni.ico.value == data.montazka.ico.value &&
                data.uvedeni.ico.value != '' &&
                data.uvedeni.email.value == data.montazka.email.value &&
                data.uvedeni.email.value != '' &&
                data.uvedeni.telefon.value == data.montazka.telefon.value &&
                data.uvedeni.telefon.value != ''
            ) {
                data.uvedeni.jakoMontazka.value = true;
                data.uvedeni.ico.value = '';
                data.uvedeni.email.value = '';
                data.uvedeni.telefon.value = '';
            }
        }
    });
    $effect(() => {
        data;
        if (mode != 'loading') {
            if (data.ir.typ.value.first == p`IR 12`) {
                data.ir.typ.value.second = p`CTC`;
            }
        }
    });
    $effect(() => {
        data;
        if (mode != 'loading') {
            if (data.mistoRealizace.jakoBydliste.value) {
                data.mistoRealizace.obec.value = '';
                data.mistoRealizace.psc.value = '';
                data.mistoRealizace.ulice.value = '';
            } else if (
                data.mistoRealizace.obec.value == data.bydliste.obec.value &&
                data.mistoRealizace.obec.value != '' &&
                data.mistoRealizace.psc.value == data.bydliste.psc.value &&
                data.mistoRealizace.psc.value != '' &&
                data.mistoRealizace.ulice.value == data.bydliste.ulice.value &&
                data.mistoRealizace.ulice.value != ''
            ) {
                data.mistoRealizace.jakoBydliste.value = true;
                data.mistoRealizace.obec.value = '';
                data.mistoRealizace.psc.value = '';
                data.mistoRealizace.ulice.value = '';
            }
        }
    });
    $effect(() => {
        data;
        if (mode != 'loading') {
            if (!data.tc.model.moznosti(data).includes(data.tc.model.value ?? '')) {
                data.tc.model.value = null;
            }
        }
    });
    $effect(() => {
        data;
        if (mode != 'loading') {
            if (data.ir.typ.value.second == p`RTC`) {
                data.tc.typ.value = 'airToWater';
            }
        }
    });
    $effect(() => {
        if (mode != 'loading' && mode != 'edit') {
            storedData.set(dataToRawData(data));
        }
    });
    let typBOXu = $derived(typBOX(data.ir.cisloBox.value));

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
                (obj) => Object.values(obj) as v.Vec<Data, unknown>[]
            )
            : []
    );

    let vysledek = $state({
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
        const company = data.uvedeni.company.value;
        if (company) {
            data.uvedeni.ico.value = company.crn
            data.uvedeni.email.value = company.email ?? '';
            data.uvedeni.telefon.value = company.phone ?? '';
            data.uvedeni.zastupce.value = company.representative ?? '';
        }
    });
    $effect(() => {
        const company = data.montazka.company.value;
        if (company) {
            data.montazka.ico.value = company.crn
            data.montazka.email.value = company.email ?? '';
            data.montazka.telefon.value = company.phone ?? '';
            data.montazka.zastupce.value = company.representative ?? '';
        }
    });
    $effect(() => {
        data.uvedeni.regulus.items = () => $techniciansList
    });
    $effect(() => {
        data.vzdalenyPristup.plati.moznosti = () => $isUserRegulusOrAdmin
            ? ['assemblyCompany', 'endCustomer', 'doNotInvoice', p`Později, dle protokolu`]
            : ['assemblyCompany', 'endCustomer']
    });
    const chyba = $derived(formaSpolecnostiJeSpatne(data.koncovyUzivatel.nazev.value))
</script>

<FormHeader showResetButton={mode === 'create' || mode === 'createStored'} store={storedData} {t}
            title={mode === 'edit' ? t.editation : t.controllerRegistration} />

{#each list as _, i}
    {#if list[i] instanceof v.Pisatkova && cisla.includes(list[i]) && list[i].zobrazit(data)}
        <Scanner
            bind:vec={list[i]}
            onScan={(text) => list[i].value = text.slice(-12)}
            {t}
            {data}
        />
    {:else}
        <VecComponent bind:vec={list[i]} {t} {data} />
    {/if}
    {#if list[i] === data.ir.cisloBox && list[i].zobrazit(data) && typBOXu}
        <p>Rozpoznáno: {typBOXu}</p>
    {/if}
    {#if list[i] === data.koncovyUzivatel.nazev && list[i].zobrazit(data) && chyba}
        <p>Pozor, zadaná forma společnosti není správně formátovaná!</p>
    {/if}
    {#if list[i] === data.montazka.ico && list[i].zobrazit(data)}
        <p>
            {#await chosen?.assemblyCompany then a}
                {#if a}
                    {t.chosenCompany}: {a}
                {/if}
            {/await}
        </p>
    {/if}
    {#if list[i] === data.uvedeni.ico && list[i].zobrazit(data)}
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
        {#if !vysledek.load}
            <button
                id="odeslat"
                type="button"
                class="btn btn-success"
                onclick={() =>
					odeslat(
						data,
						(v) => (vysledek = v),
						doNotSend,
						mode === 'edit',
						() => {
							for (const i in list) {
								list[i].zobrazitErrorVeto = true;
							}
						}
					)}
            >
                {t.save}
            </button>
        {/if}
        {#if mode === 'edit'}
            <button type="button" class="btn btn-outline-secondary ms-2" onclick={() => history.back()}>
                {t.back}
            </button>
        {/if}
    </div>

    <div class="d-inline-flex align-content-center text-break mt-2 mt-sm-0">
        {#if vysledek.load}
            <div class="spinner-border text-danger ms-2"></div>
        {/if}
        <p class="ms-2 my-auto" class:text-danger={vysledek.red}>{@html vysledek.text}</p>
    </div>
</div>
