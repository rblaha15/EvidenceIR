<script lang="ts">
    import { evidence as getEvidence, upravitServisniProtokol, vyplnitServisniProtokol } from '$lib/client/firestore';
    import { onMount } from 'svelte';
    import type { PageData } from './$types';
    import { type DataSP, dataSPToRawDataSP, defaultDataSP, type RawDataSP, rawDataSPToDataSP, type UDSP } from '$lib/SP';
    import { type Vec } from '$lib/Vec.svelte';
    import VecComponent from '$lib/components/Vec.svelte';
    import { type RawData } from '$lib/Data';
    import { currentUser, getToken } from '$lib/client/auth';
    import { detailUrl, storable } from '$lib/helpers/stores';
    import FormHeader from '../FormHeader.svelte';
    import { nowISO } from '$lib/helpers/date';
    import { type SparePart, sparePartsList, startSparePartsListening, startTechniciansListening, techniciansList } from '$lib/client/realtime';
    import { page } from '$app/state';

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
    const t = data.translations;

    const storedData = storable<RawDataSP>(`stored_sp_${data.irid}`);
    let mode: 'create' | 'edit' | 'loading' = $state('loading');

    let p: DataSP = $state(defaultDataSP());
    let evidence = $state() as RawData;
    let i = $state() as number;
    onMount(async () => {
        await startTechniciansListening();
        await startSparePartsListening();

        const snapshot = await getEvidence(data.irid);
        if (snapshot.exists()) {
            const data = snapshot.data();
            evidence = data.evidence;
            const spid = page.url.searchParams.get('edit') as string | null;
            if (spid) {
                i = Number(spid);
                p = rawDataSPToDataSP(p, data.installationProtocols[i]);
                mode = 'edit';
            } else {
                if ($storedData != null) {
                    p = rawDataSPToDataSP(p, $storedData);
                }
                mode = 'create';
            }
        }

        if (!p.zasah.datum.value)
            p.zasah.datum.value = nowISO();
    });

    let vysledek = $state({
        text: '',
        red: false,
        load: false
    });

    let list = $derived((Object.values(p) as DataSP[keyof DataSP][]).flatMap(
        (obj) => Object.values(obj) as Vec<UDSP, unknown>[]
    ));
    let d = $derived({ protokol: p, evidence } as UDSP);

    const save = async () => {
        const raw = dataSPToRawDataSP(p);
        if (
            list.some((it) => {
                if (it.zpravaJeChybna(d)) console.log(it);
                return it.zpravaJeChybna(d);
            })
        ) {
            for (const i in list) {
                list[i].zobrazitErrorVeto = true;
            }
            vysledek = {
                red: true,
                text: t.youHaveAMistake,
                load: false
            };
            return;
        }

        vysledek = { load: true, red: false, text: t.saving };
        if (mode == 'edit') {
            await upravitServisniProtokol(data.irid, i, raw);
        } else {
            await vyplnitServisniProtokol(data.irid, raw);
        }

        storedData.set(undefined);
        vysledek = {
            text: 'Přesměrování...',
            red: false,
            load: true
        };

        const token = await getToken();
        const newWin = window.open(
            detailUrl(`/pdf/installationProtocol-${i}?token=${token}`)
        );
        if (!newWin || newWin.closed) {
            vysledek = {
                text: 'Povolte prosím otevírání oken v prohlížeči',
                red: true,
                load: false
            };
        } else {
            window.location.replace(detailUrl());
        }
    };

    $effect(() => {
        if (mode != 'loading' && mode != 'edit') {
            storedData.set(dataSPToRawDataSP(p));
        }
    });

    $effect(() => {
        const ja = $techniciansList.find(t => $currentUser?.email == t.email);
        p.zasah.clovek.value = ja?.name ?? p.zasah.clovek.value;
        p.zasah.clovek.zobrazit = () => !ja;
        p.zasah.clovek.required = () => !ja;
        p.zasah.inicialy.value = ja?.initials ?? p.zasah.inicialy.value;
        p.zasah.inicialy.zobrazit = () => !ja;
        p.zasah.inicialy.required = () => !ja;
    });

    $effect(() => {
        const spareParts = $sparePartsList.map(it => ({
            ...it,
            name: it.name.replace('  ', ' '),
        }) as SparePart);
        p.nahradniDil1.dil.items = () => spareParts;
        p.nahradniDil2.dil.items = () => spareParts;
        p.nahradniDil3.dil.items = () => spareParts;
    });
</script>

{#if mode !== 'loading'}
    <FormHeader store={storedData} {t} title={mode === 'edit' ? 'Editace SP' : 'Instalační a servisní protokol'} />
    {#each list as _, i}
        <VecComponent bind:vec={list[i]} {t} data={d} />
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
