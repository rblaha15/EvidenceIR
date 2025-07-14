<script generics="
    D,
    F extends Form<D>,
    S extends unknown[][],
    P extends Pdf = Pdf,
" lang="ts">
    // noinspection ES6UnusedImports
    import type { Form } from '$lib/forms/Form';
    import { dataToRawData, type Raw, rawDataToData } from '$lib/forms/Form';
    import type { PdfParameters } from '$lib/client/pdf';
    // noinspection ES6UnusedImports
    import { type Pdf, pdfInfo, pdfParamsArray } from '$lib/client/pdf';
    import type { Translations } from '$lib/translations';
    import FormHeader from '$lib/forms/FormHeader.svelte';
    import { onMount, untrack } from 'svelte';
    import { derived as derivedStore, readable } from 'svelte/store';
    import WidgetComponent from '$lib/components/Widget.svelte';
    import { storable } from '$lib/helpers/stores';
    import { page } from '$app/state';
    import { dev } from '$app/environment';
    import { generatePdf } from '$lib/client/pdfGeneration';
    import type { IndependentFormInfo } from '$lib/forms/FormInfo';
    import FileSaver from 'file-saver';
    import { runLoading } from '$lib/helpers/globals.js';
    import ReadonlyWidget from '$lib/components/ReadonlyWidget.svelte';
    import { goto } from '$app/navigation';

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
        importOptions,
        isSendingEmails,
        openPdf,
        redirectLink,
        hideBackButton,
        showSaveAndSendButtonByDefault,
    } = formInfo;

    const storedData = storable<Raw<F>>(storeName);
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
            derivedStore(stores, values => values).subscribe(values => callback(d, f, values, mode == 'edit'));
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
            const errors = list.filter(w => w.isError(d) && w.show(d)).map(w => t.get(w.label(d, t)));
            if (errors.length > 0) {
                for (const i in list) {
                    list[i].displayErrorVeto = true;
                }
                result = {
                    red: true,
                    text: t.youHaveAMistake({ fields: errors.join(', ') }),
                    load: false,
                };
                return;
            }

            result = { load: true, red: false, text: t.saving };
            const success = await saveData(raw, mode == 'edit', f, r => result = r, t, send);

            if (!dev) storedData.set(undefined);

            if (success) {
                result = openPdf || redirectLink
                    ? { text: t.redirecting, red: false, load: true }
                    : { text: '', red: false, load: false };

                if (openPdf) {
                    try {
                        const { link, data, ...parameters } = await openPdf(raw);
                        const p = parameters as unknown as PdfParameters<P>;
                        const pdfData = await generatePdf(pdfInfo[link], page.data.languageCode, data, ...pdfParamsArray(p));

                        FileSaver.saveAs(new Blob([pdfData.pdfBytes], {
                            type: 'application/pdf',
                        }), pdfData.fileName);
                    } catch (e) {
                        console.log(e);
                    }
                }

                if (redirectLink) await goto(await redirectLink(raw), { replaceState: true });
                if (redirectLink) setTimeout(async () => result = {
                    text: t.redirectFailedHtml({ link: page.url.origin + await redirectLink(raw) }),
                    red: true,
                    load: false,
                }, 5000);
            }
        } catch (e) {
            console.error(e);
            result = {
                red: true,
                text: t.somethingWentWrongContactUsHtml,
                load: false,
            };
        }
    };

    $effect(() => {
        if (mode == 'create') {
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
    const showSaveAndSendButtonByDefaultStore = $derived(typeof showSaveAndSendButtonByDefault == 'boolean' ? readable(showSaveAndSendButtonByDefault) : showSaveAndSendButtonByDefault);
</script>

{#if mode !== 'loading'}
    <FormHeader readonly={mode === 'view'} importData={importOptions ? {
        ...importOptions, onImport, isDangerous, defaultData: () => dataToRawData(defaultData())
    } : undefined} store={storedData} {t} title={title(t, mode)}
    showBackButton={mode === 'view' || !hideBackButton?.(mode === 'edit')} />

    {#if subtitle}
        <h3>{subtitle(t, mode === 'edit')}</h3>
    {/if}
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
                    <button onclick={save(false)} class="mb-auto btn btn-success">{t.save}</button>
                {/if}
                {#if !result.load && (mode === 'edit' && isSendingEmails || $showSaveAndSendButtonByDefaultStore)}
                    <button onclick={save(true)} class="mb-auto btn btn-success text-nowrap">{t.saveAndSend}</button>
                {/if}
                {#if result.load}
                    <div class="spinner-border text-danger"></div>
                {/if}
                {#if !result.load && !hideBackButton?.(mode === 'edit')}
                    <button type="button" class="mb-auto btn btn-secondary" onclick={() => history.back()}>
                        {t.back}
                    </button>
                {/if}
            {/if}
        </div>
        <p class:text-danger={result.red} class="my-auto">{@html result.text}</p>
    </div>
{/if}
