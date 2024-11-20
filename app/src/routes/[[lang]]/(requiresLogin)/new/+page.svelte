<script lang="ts">
    import { DvojVybiratko, Pisatko, Prepinatko, Vybiratko } from '$lib/components/veci';
    import { MultiZaskrtavatko, Radio, Zaskrtavatko } from '$lib/components/veci';
    import VybiratkoFirmy from '$lib/components/VybiratkoFirmy.svelte';
    import Scanner from '$lib/components/Scanner.svelte';

    import * as v from '$lib/Vec.svelte';
    import {
        dataToRawData,
        newData,
        rawDataToData,
        type RawData,
        type Data,
        typBOX
    } from '$lib/Data';
    import { responsiblePerson } from '$lib/client/realtime';
    import { companies, filteredCompanies } from './companies';
    import odeslat from './odeslat';
    import { p } from '$lib/Vec.svelte';
    import { evidence } from '$lib/client/firestore';
    import { storable } from '$lib/helpers/stores';

    import { dev } from '$app/environment';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { nazevFirmy } from '$lib/helpers/ares';
    import FormHeader from '../detail/[ir]/FormHeader.svelte';

    const t = $page.data.translations;

    const storedData = storable<RawData>(`stored_data`);

    let mode: 'loading' | 'create' | 'edit' | 'createStored' = $state('loading');
    let data: Data = $state(newData());
    onMount(async () => {
        const ir = $page.url.searchParams.get('edit');
        if (ir) {
            const snapshot = await evidence(ir);
            console.log(snapshot);
            if (snapshot.exists() && snapshot.data() != undefined) {
                data = rawDataToData(data, snapshot.data()!.evidence);
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
                data.uvedeni.ico.updateText('');
                data.uvedeni.email.value = '';
                data.uvedeni.phone.value = '';
            } else if (
                data.uvedeni.ico.value == data.montazka.ico.value &&
                data.uvedeni.ico.value != '' &&
                data.uvedeni.email.value == data.montazka.email.value &&
                data.uvedeni.email.value != '' &&
                data.uvedeni.phone.value == data.montazka.phone.value &&
                data.uvedeni.phone.value != ''
            ) {
                data.uvedeni.jakoMontazka.value = true;
                data.uvedeni.ico.updateText('');
                data.uvedeni.email.value = '';
                data.uvedeni.phone.value = '';
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
                data.mistoRealizace.obec.updateText('');
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
                data.mistoRealizace.obec.updateText('');
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
    let typBOXu = $derived(typBOX(data.ir.cisloBOX.value));

    const filter = writable('');
    let filtered = $derived(filteredCompanies(filter));

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
                (obj) => Object.values(obj) as v.Vec<Data, any>[]
            )
            : []
    );

    let vysledek = $state({
        text: '',
        red: false,
        load: false
    });
    let doNotSend = $state(false);
</script>

<FormHeader store={storedData} {t} title={mode === 'edit' ? t.editation : t.controllerRegistration}
            showResetButton={mode === 'create' || mode === 'createStored'} />

{#each list as _, i}
    {#if list[i] === data.montazka.ico && list[i].zobrazit(data) && list[i] instanceof v.Pisatkova}
        {#if $companies.assemblyCompanies.length > 0}
            <VybiratkoFirmy
                id="Montazka"
                bind:emailVec={data.montazka.email}
                bind:phoneVec={data.montazka.phone}
                bind:zastupceVec={data.montazka.zastupce}
                bind:icoVec={data.montazka.ico}
                bind:filtr={$filter}
                vyfiltrovanyFirmy={$filtered.assemblyCompanies}
                neVyfiltrovanyFirmy={$companies.assemblyCompanies}
                {t}
            />
        {/if}
        <Pisatko
            bind:vec={list[i]}
            {t}
            {data}
            disabled={list[i] === data.ir.cislo && mode === 'edit'}
        />
    {:else if list[i] === data.uvedeni.ico && list[i].zobrazit(data) && list[i] instanceof v.Pisatkova}
        {#if $companies.commissioningCompanies.length > 0}
            <VybiratkoFirmy
                id="Uvedeni"
                bind:emailVec={data.uvedeni.email}
                bind:phoneVec={data.uvedeni.phone}
                bind:zastupceVec={data.uvedeni.zastupce}
                bind:icoVec={data.uvedeni.ico}
                bind:filtr={$filter}
                vyfiltrovanyFirmy={$filtered.commissioningCompanies}
                neVyfiltrovanyFirmy={$companies.commissioningCompanies}
                {t}
            />
        {/if}
        <Pisatko
            bind:vec={list[i]}
            {t}
            {data}
            disabled={list[i] === data.ir.cislo && mode === 'edit'}
        />
    {:else if list[i] === data.tc.cislo && list[i].zobrazit(data)}
        <Scanner
            bind:vec={data.tc.cislo}
            zobrazit={data.ir.typ.value.second === p`CTC`}
            onScan={(text) => data.tc.cislo.updateText(text.slice(-12))}
            {t}
            {data}
        />
    {:else if list[i] instanceof v.Nadpisova && list[i].zobrazit(data)}
        <h2>{t.get(list[i].nazev(data))}</h2>
    {:else if list[i] instanceof v.Textova && list[i].zobrazit(data)}
        <p>{t.get(list[i].nazev(data))}</p>
    {:else if list[i] instanceof v.Pisatkova && list[i].zobrazit(data)}
        <Pisatko
            bind:vec={list[i]}
            {t}
            {data}
            disabled={list[i] === data.ir.cislo && mode === 'edit'}
        />
    {:else if list[i] instanceof v.DvojVybiratkova && list[i].zobrazit(data)}
        <DvojVybiratko bind:vec={list[i]} {t} {data} />
    {:else if list[i] instanceof v.Vybiratkova && list[i].zobrazit(data)}
        <Vybiratko bind:vec={list[i]} {t} {data} />
    {:else if list[i] instanceof v.Radiova && list[i].zobrazit(data)}
        <Radio bind:vec={list[i]} {t} {data} />
    {:else if list[i] instanceof v.Prepinatkova && list[i].zobrazit(data)}
        <Prepinatko bind:vec={list[i]} {t} {data} />
    {:else if list[i] instanceof v.MultiZaskrtavatkova && list[i].zobrazit(data)}
        <MultiZaskrtavatko {t} bind:vec={list[i]} {data} />
    {:else if list[i] instanceof v.Zaskrtavatkova && list[i].zobrazit(data)}
        <Zaskrtavatko {t} bind:vec={list[i]} {data} />
    {/if}
    {#if list[i] === data.ir.cisloBOX && list[i].zobrazit(data) && typBOXu}
        <p>Rozpoznáno: {typBOXu}</p>
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
        <p class:text-danger={vysledek.red} class="ms-2 my-auto">{@html vysledek.text}</p>
    </div>
</div>
