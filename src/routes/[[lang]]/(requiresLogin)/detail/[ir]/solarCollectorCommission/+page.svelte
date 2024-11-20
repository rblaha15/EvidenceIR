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
    import {
        DvojVybiratkova,
        MultiZaskrtavatkova,
        Nadpisova,
        Pisatkova,
        Prepinatkova,
        Radiova,
        Textova,
        Vybiratkova,
        Zaskrtavatkova,
        type Vec
    } from '$lib/Vec.svelte';
    import {
        Pisatko,
        DvojVybiratko,
        Vybiratko,
        Radio,
        Prepinatko,
        MultiZaskrtavatko,
        Zaskrtavatko
    } from '$lib/components/veci';
    import type { RawData } from '$lib/Data';
    import { getToken } from '$lib/client/auth';
    import { storable } from '$lib/helpers/stores';
    import FormHeader from '../FormHeader.svelte';

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
    const ir = data.ir;
    const t = data.translations;

    const storedCommission = storable<RawUvedeniSOL>(`stored_commission_${ir}`);

    let u: UvedeniSOL = $state(defaultUvedeniSOL());
    let evidence = $state() as RawData;
    onMount(async () => {
        const snapshot = await getEvidence(ir as string);
        if (snapshot.exists()) {
            evidence = snapshot.data().evidence;
        }
        const stored = $storedCommission;
        if (stored == null) {
        } else {
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
            (obj) => Object.values(obj) as Vec<UDSOL, any>[]
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
        await uvestSOLDoProvozu(ir as string, raw);

        storedCommission.set(undefined);
        vysledek = {
            text: 'Přesměrování...',
            red: false,
            load: true
        };

        const token = await getToken();
        const newWin = window.open(
            `/${data.languageCode}/detail/${data.ir}/pdf/solarCollectorCommissionProtocol?token=${token}`
        );
        if (!newWin || newWin.closed) {
            vysledek = {
                text: 'Povolte prosím otevírání oken v prohlížeči',
                red: true,
                load: false
            };
        } else {
            window.location.replace(`/${data.languageCode}/detail/${data.ir}`);
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
        {#if list[i] instanceof Nadpisova && list[i].zobrazit(d)}
            <h2>{t.get(list[i].nazev(d))}</h2>
        {:else if list[i] instanceof Textova && list[i].zobrazit(d)}
            <p>{t.get(list[i].nazev(d))}</p>
        {:else if list[i] instanceof Pisatkova && list[i].zobrazit(d)}
            <Pisatko bind:vec={list[i]} {t} data={d} />
        {:else if list[i] instanceof DvojVybiratkova && list[i].zobrazit(d)}
            <DvojVybiratko bind:vec={list[i]} {t} data={d} />
        {:else if list[i] instanceof Vybiratkova && list[i].zobrazit(d)}
            <Vybiratko bind:vec={list[i]} {t} data={d} />
        {:else if list[i] instanceof Radiova && list[i].zobrazit(d)}
            <Radio bind:vec={list[i]} {t} data={d} />
        {:else if list[i] instanceof Prepinatkova && list[i].zobrazit(d)}
            <Prepinatko bind:vec={list[i]} {t} data={d} />
        {:else if list[i] instanceof MultiZaskrtavatkova && list[i].zobrazit(d)}
            <MultiZaskrtavatko {t} bind:vec={list[i]} data={d} />
        {:else if list[i] instanceof Zaskrtavatkova && list[i].zobrazit(d)}
            <Zaskrtavatko {t} bind:vec={list[i]} data={d} />
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
