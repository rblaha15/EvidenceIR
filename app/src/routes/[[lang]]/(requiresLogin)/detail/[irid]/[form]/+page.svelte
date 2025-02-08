<script generics="D, F extends Form<D>, S extends unknown[][]" lang="ts">
    import { formInfo, type FormInfo, type FormName } from '$lib/forms/forms.svelte';
    import type { PageProps } from './$types';
    import { evidence as getEvidence } from '$lib/client/firestore';
    import { onMount } from 'svelte';
    import { derived as derivedStore } from 'svelte/store';
    import WidgetComponent from '$lib/components/Widget.svelte';
    import type { Data } from '$lib/forms/Data';
    import { getToken } from '$lib/client/auth';
    import { storable } from '$lib/helpers/stores';
    // noinspection ES6UnusedImports
    import type { Form } from '$lib/forms/Form';
    import { dataToRawData, type Raw, rawDataToData } from '$lib/forms/Form';
    import FormHeader from '../FormHeader.svelte';
    import { detailUrl } from '$lib/helpers/runes.svelte';

    const { data }: PageProps = $props();
    const formName = data.formName as FormName;
    const t = data.translations;
    const irid = data.irid;
    const {
        storeName,
        defaultData,
        pdfLink,
        saveData,
        createWidgetData,
        title,
        onMount: mountEffect,
        storeEffects,
        getEditData,
        subtitle,
    } = formInfo[formName] as FormInfo<D, F, S>;

    const storedData = storable<Raw<F>>(`${storeName}_${(irid)}`);
    let mode: 'create' | 'edit' | 'loading' = $state('loading');

    let f: F = $state(defaultData());
    let evidence = $state() as Raw<Data>;
    onMount(async () => {
        const snapshot = await getEvidence(irid);
        if (snapshot.exists()) {
            const ir = snapshot.data();
            evidence = ir.evidence;
            const editData = getEditData?.(ir);
            if (editData) {
                f = rawDataToData(f, editData);
                mode = 'edit';
            } else {
                if ($storedData != null)
                    f = rawDataToData(f, $storedData);
                mode = 'create';
            }
        }

        await mountEffect?.(f);

        storeEffects?.forEach(([callback, stores]) => {
            derivedStore(stores, values => values).subscribe(values => callback(f, values));
        });
    });

    let vysledek = $state({
        text: '',
        red: false,
        load: false
    });

    let list = $derived(f.getValues().flatMap(obj => obj.getValues()));
    let d = $derived(createWidgetData(evidence, f));

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
        await saveData(irid, raw, mode == 'edit');

        storedData.set(undefined);
        vysledek = {
            text: 'Přesměrování...',
            red: false,
            load: true
        };

        const token = await getToken();
        const newWin = window.open(
            detailUrl(`/pdf/${pdfLink}?token=${token}`)
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
            storedData.set(dataToRawData(f));
        }
    });
</script>

{#if mode !== 'loading'}
    <FormHeader store={storedData} {t} title={t.get(title(mode === 'edit', t))} />
    {#if subtitle}
        <h3>{t.get(subtitle(mode === 'edit', t))}</h3>
    {/if}
    {#each list as _, i}
        <WidgetComponent bind:widget={list[i]} {t} data={d} />
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
