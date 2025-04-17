<script generics="D, F extends Form<D>, S extends unknown[][]" lang="ts">
    // noinspection ES6UnusedImports
    import type { Form } from '$lib/forms/Form';
    import { dataToRawData, type Raw, rawDataToData } from '$lib/forms/Form';
    import type { Translations } from '$lib/translations';
    import type { DetachedFormInfo } from '$lib/forms/forms.svelte.js';
    import FormHeader from '$lib/forms/FormHeader.svelte';
    import { onMount, type Snippet, untrack } from 'svelte';
    import { derived as derivedStore } from 'svelte/store';
    import WidgetComponent from '$lib/components/Widget.svelte';
    import { storable } from '$lib/helpers/stores';
    import type { Widget } from '$lib/Widget.svelte';

    const { t, formInfo, trailingContent }: {
        t: Translations,
        formInfo: DetachedFormInfo<D, F, S>,
        trailingContent?: Snippet<[widget: Widget<D, F>, d: D, f: F]>,
    } = $props();
    const {
        storeName,
        defaultData,
        saveData,
        createWidgetData,
        title,
        onMount: mountEffect,
        storeEffects,
        getEditData,
        subtitle,
        storeData,
        importOptions,
    } = formInfo;

    const storedData = storable<Raw<F>>(storeName);
    let mode: 'create' | 'edit' | 'loading' = $state('loading');

    let f: F = $state(defaultData());
    onMount(async () => {
        const editData = await getEditData?.();
        if (editData) {
            f = rawDataToData(f, editData);
            mode = 'edit';
        } else {
            if ($storedData != null)
                f = rawDataToData(f, $storedData);
            mode = 'create';
        }

        await mountEffect?.(d, f);

        storeEffects?.forEach(([callback, stores]) => {
            derivedStore(stores, values => values).subscribe(values => callback(d, f, values));
        });
    });

    let vysledek = $state({
        text: '',
        red: false,
        load: false
    });

    let list = $derived(f.getValues().flatMap(obj => obj.getValues()));
    let d = $derived(createWidgetData(f));

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
        await saveData(raw, mode == 'edit', f, result => vysledek = result);

        storedData.set(undefined);
    };

    $effect(() => {
        if (mode != 'loading' && mode != 'edit') {
            storedData.set((storeData ?? dataToRawData)(f));
        }
    });

    const onImport = (newData: Raw<F>) => {
        f = rawDataToData(f, newData);
        for (const i in list) {
            list[i].displayErrorVeto = true;
        }
        importOptions!.onImport(d, f);
    };

    const isDangerous = $derived(JSON.stringify(dataToRawData(f)) != JSON.stringify(dataToRawData(untrack(defaultData))));
</script>

{#if mode !== 'loading'}
    <FormHeader store={storedData} {t} title={title(t, mode === 'edit')} importData={importOptions ? {
        ...importOptions, onImport, isDangerous, defaultData: () => dataToRawData(defaultData())
    } : undefined} />
    {#if subtitle}
        <h3>{subtitle(t, mode === 'edit')}</h3>
    {/if}
    {#each list as widget, i}
        <WidgetComponent bind:widget={list[i]} {t} data={d} />
        {@render trailingContent?.(widget, d, f)}
    {/each}
    <div class="d-inline-flex align-content-center">
        {#if !vysledek.load}
            <button onclick={save} class="btn btn-success">{t.save}</button>
        {/if}
        {#if vysledek.load}
            <div class="spinner-border text-danger ms-2"></div>
        {/if}
        <button type="button" class="btn btn-secondary ms-2" onclick={() => history.back()}>
            {t.back}
        </button>
        <p class:text-danger={vysledek.red} class="ms-2 my-auto">{@html vysledek.text}</p>
    </div>
{:else}
    <div class="spinner-border text-danger m-2"></div>
{/if}
