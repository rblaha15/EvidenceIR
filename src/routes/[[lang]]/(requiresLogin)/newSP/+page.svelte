<script lang="ts">
    import type { PageProps } from './$types';
    import { onMount } from 'svelte';
    import WidgetComponent from '$lib/components/Widget.svelte';
    import { currentUser, getToken } from '$lib/client/auth';
    import { storable } from '$lib/helpers/stores';
    import { dataToRawData, type Form, type Raw, rawDataToData } from '$lib/forms/Form';
    import { relUrl } from '$lib/helpers/runes.svelte';
    import { type DataSP2, defaultDataSP2, type UDSP2 } from '$lib/forms/SP2';
    import { compactOtherSpareData, otherPart, updateOtherSpareParts } from '$lib/forms/SP.svelte';
    import FormHeader from '../detail/[irid]/FormHeader.svelte';
    import {
        type SparePart,
        sparePartsList,
        startSparePartsListening,
        startTechniciansListening,
        techniciansList
    } from '$lib/client/realtime';
    import { nowISO, todayISO } from '$lib/helpers/date';
    import { extractSPIDFromRawData, vyplnitObecnyServisniProtokol } from '$lib/client/firestore';
    import { formaSpolecnostiJeSpatne } from '$lib/helpers/ir';
    import { nazevFirmy, regulusCRN } from '$lib/helpers/ares';
    import { companies } from '../new/companies';
    import Scanner from '$lib/components/Scanner.svelte';
    import { InputWidget } from '$lib/Widget.svelte';

    const { data }: PageProps = $props();
    const t = data.translations;

    const storedData = storable<Raw<DataSP2>>(`stored_new_SP`);
    let mode: 'create' | 'loading' = $state('loading');

    let f = $state(defaultDataSP2());
    onMount(async () => {
        if ($storedData != null)
            f = rawDataToData(f, $storedData);
        mode = 'create';

        await startTechniciansListening();
        await startSparePartsListening();
        if (!f.zasah.datum.value)
            f.zasah.datum.value = nowISO();
        if (!f.system.datumUvedeni.value)
            f.system.datumUvedeni.value = todayISO();
    });

    let vysledek = $state({
        text: '',
        red: false,
        load: false
    });

    let list = $derived(((f as Form<UDSP2>).getValues()).flatMap(obj => obj.getValues()));
    let d = $derived(<UDSP2>{ protokol: f, d: f });

    const save = async () => {
        const raw = dataToRawData(f);
        if (
            list.some((it) => {
                if (it.isError(d)) console.log(it);
                return it.isError(d);
            })
        ) {
            for (const i in list) {
                list[i].displayErrorVeto = true;
            }
            vysledek = {
                red: true,
                text: t.youHaveAMistake,
                load: false
            };
            return;
        }

        vysledek = { load: true, red: false, text: t.saving };
        compactOtherSpareData(raw, f);
        await vyplnitObecnyServisniProtokol(raw)

        storedData.set(undefined);
        vysledek = {
            text: 'Přesměrování...',
            red: false,
            load: true
        };

        const token = await getToken();
        const newWin = window.open(
            relUrl(`/detail/${extractSPIDFromRawData(raw)}/pdf/publicInstallationProtocol?token=${token}`)
        );
        if (!newWin || newWin.closed) {
            vysledek = {
                text: 'Povolte prosím otevírání oken v prohlížeči',
                red: true,
                load: false
            };
        } else {
            window.location.replace(relUrl());
        }
    };

    $effect(() => {
        if (mode != 'loading') {
            const raw = dataToRawData(f);
            compactOtherSpareData(raw, f);
            if (f.uvedeni.jakoMontazka.value) {
                raw.uvedeni.ico = raw.montazka.ico;
                raw.uvedeni.email = raw.montazka.email;
                raw.uvedeni.telefon = raw.montazka.telefon;
            } else if (raw.uvedeni.ico == regulusCRN.toString() && f.uvedeni.regulus.value) {
                raw.uvedeni.email = f.uvedeni.regulus.value.email;
                raw.uvedeni.telefon = f.uvedeni.regulus.value.phone;
                raw.uvedeni.zastupce = f.uvedeni.regulus.value.name;
            }
            if (f.mistoRealizace.jakoBydliste.value) {
                raw.mistoRealizace.ulice = raw.bydliste.ulice;
                raw.mistoRealizace.obec = raw.bydliste.obec;
                raw.mistoRealizace.psc = raw.bydliste.psc;
            }
            storedData.set(raw);
        }
    });

    $effect(() => {
        const ja = $techniciansList.find(t => $currentUser?.email == t.email);
        f.zasah.clovek.value = ja?.name ?? f.zasah.clovek.value;
        f.zasah.clovek.show = () => !ja;
        f.zasah.clovek.required = () => !ja;
        f.zasah.inicialy.value = ja?.initials ?? f.zasah.inicialy.value;
        f.zasah.inicialy.show = () => !ja;
        f.zasah.inicialy.required = () => !ja;
    })
    $effect(() => {
        const spareParts = [otherPart, ...$sparePartsList.map(it => ({
            ...it,
            name: it.name.replace('  ', ' '),
        }) as SparePart)];
        [f.nahradniDil1, f.nahradniDil2, f.nahradniDil3].forEach(nahradniDil => {
            nahradniDil.dil.items = () => spareParts;
        });
        updateOtherSpareParts(f, spareParts);
    })

    $effect(() => {
        f;
        if (mode != 'loading') {
            if (f.uvedeni.jakoMontazka.value) {
                f.uvedeni.ico.value = '';
                f.uvedeni.email.value = '';
                f.uvedeni.telefon.value = '';
            } else if (
                f.uvedeni.ico.value == f.montazka.ico.value &&
                f.uvedeni.ico.value != '' &&
                f.uvedeni.email.value == f.montazka.email.value &&
                f.uvedeni.email.value != '' &&
                f.uvedeni.telefon.value == f.montazka.telefon.value &&
                f.uvedeni.telefon.value != ''
            ) {
                f.uvedeni.jakoMontazka.value = true;
                f.uvedeni.ico.value = '';
                f.uvedeni.email.value = '';
                f.uvedeni.telefon.value = '';
            }
        }
    });
    $effect(() => {
        f;
        if (mode != 'loading') {
            if (f.mistoRealizace.jakoBydliste.value) {
                f.mistoRealizace.obec.value = '';
                f.mistoRealizace.psc.value = '';
                f.mistoRealizace.ulice.value = '';
            } else if (
                f.mistoRealizace.obec.value == f.bydliste.obec.value &&
                f.mistoRealizace.obec.value != '' &&
                f.mistoRealizace.psc.value == f.bydliste.psc.value &&
                f.mistoRealizace.psc.value != '' &&
                f.mistoRealizace.ulice.value == f.bydliste.ulice.value &&
                f.mistoRealizace.ulice.value != ''
            ) {
                f.mistoRealizace.jakoBydliste.value = true;
                f.mistoRealizace.obec.value = '';
                f.mistoRealizace.psc.value = '';
                f.mistoRealizace.ulice.value = '';
            }
        }
    });
    let chosen = $derived(
        f && mode != 'loading'
            ? {
                assemblyCompany: nazevFirmy(f.montazka.ico.value),
                commissioningCompany: nazevFirmy(f.uvedeni.ico.value)
            }
            : undefined
    );

    $effect(() => {
        f.uvedeni.company.items = () => $companies.commissioningCompanies;
        f.montazka.company.items = () => $companies.assemblyCompanies;
    });
    $effect(() => {
        const company = f.uvedeni.company.value;
        if (company) {
            f.uvedeni.ico.value = company.crn
            f.uvedeni.email.value = company.email ?? '';
            f.uvedeni.telefon.value = company.phone ?? '';
            f.uvedeni.zastupce.value = company.representative ?? '';
        }
    });
    $effect(() => {
        const company = f.montazka.company.value;
        if (company) {
            f.montazka.ico.value = company.crn
            f.montazka.email.value = company.email ?? '';
            f.montazka.telefon.value = company.phone ?? '';
            f.montazka.zastupce.value = company.representative ?? '';
        }
    });
    $effect(() => {
        if (f.uvedeni.ico.value == regulusCRN.toString() && f.uvedeni.email.value) {
            f.uvedeni.regulus.value = f.uvedeni.regulus.items(d).find(t => t.email == f.uvedeni.email.value) ?? f.uvedeni.regulus.value
        }
    });
    $effect(() => {
        f.uvedeni.regulus.items = () => $techniciansList
    });
    const chyba = $derived(formaSpolecnostiJeSpatne(f.koncovyUzivatel.nazev.value))
</script>

{#if mode !== 'loading'}
    <FormHeader store={storedData} {t} title="Instalační a servisní protokol" />
    {#each list as _, i}
        <WidgetComponent bind:widget={list[i]} {t} data={d} />
        {#if list[i] === f.koncovyUzivatel.nazev && list[i].show(d) && chyba}
            <p>Pozor, zadaná forma společnosti není správně formátovaná!</p>
        {/if}
        {#if list[i] === f.montazka.ico && list[i].show(d)}
            <p>
                {#await chosen?.assemblyCompany then a}
                    {#if a}
                        {t.chosenCompany}: {a}
                    {/if}
                {/await}
            </p>
        {/if}
        {#if list[i] === f.uvedeni.ico && list[i].show(d)}
            <p>
                {#await chosen?.commissioningCompany then c}
                    {#if c}
                        {t.chosenCompany}: {c}
                    {/if}
                {/await}
            </p>
        {/if}
    {/each}
    <div class="d-inline-flex align-content-center">
        {#if !vysledek.load}
            <button onclick={save} class="btn btn-success">{t.save}</button>
        {/if}
        {#if vysledek.load}
            <div class="spinner-border text-danger ms-2"></div>
        {/if}
        <button type="button" class="btn btn-outline-secondary ms-2" onclick={() => history.back()}>
            {t.back}
        </button>
        <p class:text-danger={vysledek.red} class="ms-2 my-auto">{@html vysledek.text}</p>
    </div>
{:else}
    <div class="spinner-border text-danger m-2"></div>
{/if}
