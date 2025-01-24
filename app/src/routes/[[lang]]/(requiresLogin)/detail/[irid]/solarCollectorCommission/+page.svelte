<script lang="ts">
    import { evidence as getEvidence, uvestSOLDoProvozu } from '$lib/client/firestore';
    import { onMount } from 'svelte';
    import type { PageData } from './$types';
    import {
        defaultUvedeniSOL,
        rawUvedeniSOLToUvedeniSOL,
        uvedeniSOLToRawUvedeniSOL,
        type RawUvedeniSOL,
        type UDSOL,
        type UvedeniSOL
    } from '$lib/UvedeniSOL';
    import { type Vec } from '$lib/Vec.svelte';
    import VecComponent from '$lib/components/Vec.svelte';
    import type { RawData } from '$lib/Data';
    import { getToken } from '$lib/client/auth';
    import { detailUrl, storable } from '$lib/helpers/stores';
    import FormHeader from '../FormHeader.svelte';

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
    const t = data.translations;

    const storedCommission = storable<RawUvedeniSOL>(`stored_solar_collector_commission_${data.irid}`);

    let u: UvedeniSOL = $state(defaultUvedeniSOL());
    let evidence = $state() as RawData;
    onMount(async () => {
        const snapshot = await getEvidence(data.irid);
        if (snapshot.exists()) {
            evidence = snapshot.data().evidence;
        }
        const stored = $storedCommission;
        if (stored != null) {
            u = rawUvedeniSOLToUvedeniSOL(u, stored);
        }
    });

    let vysledek = $state({
        text: '',
        red: false,
        load: false
    });

    let list = $derived(
        (Object.values(u) as UvedeniSOL[keyof UvedeniSOL][]).flatMap(
            (obj) => Object.values(obj) as Vec<UDSOL, unknown>[]
        )
    );
    let d = $derived({ uvedeni: u, evidence } as UDSOL);

    const save = async () => {
        const raw = uvedeniSOLToRawUvedeniSOL(u);
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
        await uvestSOLDoProvozu(data.irid, raw);

        storedCommission.set(undefined);
        vysledek = {
            text: 'Přesměrování...',
            red: false,
            load: true
        };

        const token = await getToken();
        const newWin = window.open(
            detailUrl(`/pdf/solarCollectorCommissionProtocol?token=${token}`)
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
        if (evidence) {
            storedCommission.set(uvedeniSOLToRawUvedeniSOL(u));
        }
    });
</script>

{#if evidence}
    <FormHeader store={storedCommission} {t} title={t.commissioning} />
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
