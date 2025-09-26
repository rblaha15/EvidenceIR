<script generics="
    D,
    F extends Form<D>,
    S extends unknown[][],
    P extends Pdf = Pdf,
" lang="ts">
    // noinspection ES6UnusedImports
    import { compareRawData, type Form } from '$lib/forms/Form';
    import { dataToRawData, type Raw, rawDataToData } from '$lib/forms/Form';
    // noinspection ES6UnusedImports
    import { type Pdf } from '$lib/pdf/pdf';
    import type { Translations } from '$lib/translations';
    import FormHeader from '$lib/forms/FormHeader.svelte';
    import { onMount, untrack } from 'svelte';
    import { derived as derivedStore, readable } from 'svelte/store';
    import WidgetComponent from '$lib/components/Widget.svelte';
    import { storable } from '$lib/helpers/stores';
    import { dev } from '$app/environment';
    import type { IndependentFormInfo } from '$lib/forms/FormInfo';
    import { runLoading } from '$lib/helpers/globals.js';
    import ReadonlyWidget from '$lib/components/ReadonlyWidget.svelte';
    import { goto } from '$app/navigation';
    import { generatePdfPreviewUrl } from '../../routes/[[lang]]/helpers';
    import { relUrl } from '$lib/helpers/runes.svelte';

    const { t, formInfo, editData, viewData }: {
        t: Translations,
        formInfo: IndependentFormInfo<D, F, S, P>,
        editData: Raw<F> | undefined,
        viewData: Raw<F> | undefined,
    } = $props();

    const {
        storeName,
        defaultData,
        saveData,
        createWidgetData,
        title,
        onMount: mountEffect,
        storeEffects,
        subtitle,
        storeData,
        excelImport,
        pdfImport,
        isSendingEmails,
        openPdf,
        redirectLink,
        hideBackButton,
        showSaveAndSendButtonByDefault,
    } = formInfo;

    const storedData = storable<Raw<F>>(storeName());
    let mode: 'create' | 'edit' | 'loading' | 'view' = $state('loading');

    let f: F = $state(defaultData());
    onMount(async () => {
        await runLoading(async () => {
            if (viewData) {
                f = rawDataToData(f, viewData);
                mode = 'view';
            } else if (editData) {
                f = rawDataToData(f, editData);
                mode = 'edit';
            } else if ($storedData) {
                f = rawDataToData(f, $storedData);
                mode = 'create';
            } else
                mode = 'create';
        });

        await mountEffect?.(d, f, mode as 'create' | 'edit' | 'view');

        storeEffects?.forEach(([callback, stores]) => {
            derivedStore(stores, values => values).subscribe(values => callback(d, f, values, mode == 'edit', t));
        });
    });

    let result = $state({
        text: '',
        red: false,
        load: false,
    });

    const list = $derived(f.getValues().flatMap(obj => obj.getValues()));
    const d = $derived(createWidgetData(f));

    const save = (send: boolean) => async () => {
        try {
            const raw = dataToRawData(f);
            const errors = list.filter(w => w.isError(d) && w.show(d)).map(w => w.label(t, d));
            if (errors.length > 0) {
                for (const i in list) {
                    list[i].displayErrorVeto = true;
                }
                result = {
                    red: true,
                    text: t.form.youHaveAMistake({ fields: errors.join(', ') }),
                    load: false,
                };
                return;
            }

            result = { load: true, red: false, text: t.form.saving };
            const success = await saveData(raw, mode == 'edit', f, r => result = r, t, send, () => f = defaultData());

            if (!dev) storedData.set(undefined);

            if (success) {
                result = openPdf || redirectLink
                    ? { text: t.form.redirecting, red: false, load: true }
                    : { text: '', red: false, load: false };

                if (openPdf) {
                    const o = await openPdf(raw);
                    const url = generatePdfPreviewUrl(o);
                    const gotoUrl = new URL(relUrl('/detail'), url.origin);
                    url.searchParams.get('irid')?.also(u => gotoUrl.searchParams.set('irid', u));
                    url.searchParams.get('spid')?.also(u => gotoUrl.searchParams.set('spid', u));
                    gotoUrl.searchParams.set('goto', url.pathname + url.search);
                    await goto(gotoUrl, { replaceState: true });
                } else if (redirectLink)
                    await goto(await redirectLink(raw), { replaceState: true });
            }
        } catch (e) {
            console.error(e);
            result = {
                red: true,
                text: t.form.somethingWentWrongContactUsHtml,
                load: false,
            };
        }
    };

    $effect(() => {
        if (mode == 'create') {
            storedData.set((storeData ?? dataToRawData)(f));
        }
    });

    const onImportExcel = (newData: Raw<F>) => {
        f = rawDataToData(f, newData);
        for (const i in list) {
            list[i].displayErrorVeto = true;
        }
        excelImport!.onImport(d, f);
    };

    const onImportPdf = (newData: Raw<F>) => {
        f = rawDataToData(f, newData);
        for (const i in list) {
            list[i].displayErrorVeto = true;
        }
        pdfImport!.onImport(d, f);
    };

    const isDangerous = $derived(compareRawData(dataToRawData(f), dataToRawData(untrack(defaultData))));
    const showSaveAndSendButtonByDefaultStore = $derived(typeof showSaveAndSendButtonByDefault == 'boolean' ? readable(showSaveAndSendButtonByDefault) : showSaveAndSendButtonByDefault);
</script>

{#if mode !== 'loading'}
    {#if subtitle}
        <h3 class="m-0">{subtitle(t, mode === 'edit')}</h3>
    {/if}

    <FormHeader readonly={mode === 'view'} excelImport={excelImport ? {
        ...excelImport, onImport: onImportExcel, isDangerous, defaultData: () => dataToRawData(defaultData())
    } : undefined} pdfImport={pdfImport ? {
        ...pdfImport, onImport: onImportPdf, isDangerous, defaultData: () => dataToRawData(defaultData())
    } : undefined} store={storedData} {t} title={title(t, mode)}
    showBackButton={mode === 'view' || !hideBackButton?.(mode === 'edit')} />
    {#each list as _, i}
        {#if mode === 'view'}
            <ReadonlyWidget widget={list[i]} {t} data={d} />
        {:else}
            <WidgetComponent bind:widget={list[i]} {t} data={d} />
        {/if}
    {/each}
    <div class="d-flex flex-column flex-sm-row align-items-start gap-3">
        <div class="d-flex gap-3 flex-wrap">
            {#if mode !== 'view'}
                {#if !result.load && (mode === 'edit' && isSendingEmails || !$showSaveAndSendButtonByDefaultStore)}
                    <button onclick={save(false)} class="mb-auto btn btn-success">{t.form.save}</button>
                {/if}
                {#if !result.load && (mode === 'edit' && isSendingEmails || $showSaveAndSendButtonByDefaultStore)}
                    <button onclick={save(true)} class="mb-auto btn btn-success text-nowrap">{t.form.saveAndSend}</button>
                {/if}
                {#if result.load}
                    <div class="spinner-border text-danger"></div>
                {/if}
                {#if !result.load && !hideBackButton?.(mode === 'edit')}
                    <button type="button" class="mb-auto btn btn-secondary" onclick={() => history.back()}>
                        {t.form.back}
                    </button>
                {/if}
            {/if}
        </div>
        <p class:text-danger={result.red} class="my-auto">{@html result.text}</p>
    </div>
{/if}
