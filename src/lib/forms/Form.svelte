<script generics="
    D,
    F extends Form<D>,
    S extends unknown[][],
    P extends Pdf = Pdf,
    O extends Record<string, unknown> = Record<never, unknown>,
" lang="ts">
    // noinspection ES6UnusedImports
    import { compareRawData, dataToRawData, type Form, type Raw, rawDataToData } from '$lib/forms/Form';
    // noinspection ES6UnusedImports
    import { type Pdf } from '$lib/pdf/pdf';
    import type { Translations } from '$lib/translations';
    import FormHeader from '$lib/forms/FormHeader.svelte';
    import { onMount, untrack } from 'svelte';
    import { derived as derivedStore, type Readable, readable } from 'svelte/store';
    import WidgetComponent from '$lib/components/Widget.svelte';
    import { storable } from '$lib/helpers/stores';
    import { dev } from '$app/environment';
    import { type ButtonKey, buttonKeys, type IndependentFormInfo } from '$lib/forms/FormInfo';
    import { refreshTOC, runLoading } from '$lib/helpers/globals.js';
    import ReadonlyWidget from '$lib/components/ReadonlyWidget.svelte';
    import { goto } from '$app/navigation';
    import { generatePdfPreviewUrl } from '../../routes/[[lang]]/helpers';
    import { relUrl } from '$lib/helpers/runes.svelte';
    import { TitleWidget } from '$lib/forms/Widget.svelte';
    import Icon from '$lib/components/Icon.svelte';

    const { t, formInfo, editData, viewData, other }: {
        t: Translations,
        formInfo: IndependentFormInfo<D, F, S, P, O>,
        editData: Raw<F> | undefined,
        viewData: Raw<F> | undefined,
        other: O,
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
        openPdf,
        redirectLink,
        buttons,
    } = formInfo;

    const storedData = storable<Raw<F>>(storeName(other));
    let mode: 'create' | 'edit' | 'loading' | 'view' = $state('loading');

    let f: F = $state(defaultData(other));
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

        await mountEffect?.(d, f, mode as 'create' | 'edit' | 'view', other);

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
    const d = $derived(createWidgetData(f, other)) as D;

    $effect(() => {
        list
            .filter(w => w instanceof TitleWidget)
            .filter(w => w.show(d))
            .map(w => w.text(t, d))
            .awaitAll()
            .then(refreshTOC);
    });

    const save = (send: boolean, draft: boolean) => async () => {
        try {
            const raw = dataToRawData(f);
            const errors = list.filter(w => w.isError(d) && w.show(d)).map(w => w.label(t, d));
            if (errors.length > 0 && !draft) {
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
            const success = await saveData(raw, mode == 'edit', f, r => result = r, t, send, draft, other, () => f = defaultData(other));

            if (success) {
                if (!dev) storedData.set(undefined);

                result = openPdf || redirectLink
                    ? { text: t.form.redirecting, red: false, load: true }
                    : { text: '', red: false, load: false };

                if (openPdf) {
                    const o = await openPdf(raw, other);
                    const url = generatePdfPreviewUrl(o);
                    const gotoUrl = new URL(relUrl('/detail'), url.origin);
                    url.searchParams.get('irid')?.also(u => gotoUrl.searchParams.set('irid', u));
                    url.searchParams.get('spid')?.also(u => gotoUrl.searchParams.set('spid', u));
                    gotoUrl.searchParams.set('goto', url.pathname + url.search);
                    await goto(gotoUrl, { replaceState: true });
                } else if (redirectLink)
                    await goto(await redirectLink(raw, other), { replaceState: true });
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
            storedData.set((storeData ?? dataToRawData)(f, other));
        }
    });

    const onImportExcel = (newData: Raw<F>) => {
        f = rawDataToData(f, newData);
        for (const i in list) {
            list[i].displayErrorVeto = true;
        }
        excelImport!.onImport(d, f, other);
    };

    const onImportPdf = (newData: Raw<F>) => {
        f = rawDataToData(f, newData);
        for (const i in list) {
            list[i].displayErrorVeto = true;
        }
        pdfImport!.onImport(d, f, other);
    };

    const isDangerous = $derived(compareRawData(dataToRawData(f), dataToRawData(untrack(() => defaultData(other)))));
    const buttonsStore: Readable<{ [B in ButtonKey]: boolean }> = $derived.by(() => {
        const b = buttons?.(mode == 'edit', other) ?? {};
        const br = 'subscribe' in b ? b : readable(b);
        return derivedStore(br, br => buttonKeys.associateWith(k => br[k] ?? false));
    });
</script>

{#if mode !== 'loading'}
    {#if subtitle}
        <h2 class="m-0" id="form-subtitle">{subtitle(t, mode === 'edit')}</h2>
    {/if}

    <FormHeader readonly={mode === 'view'} excelImport={excelImport ? {
        ...excelImport, onImport: onImportExcel, isDangerous, defaultData: () => dataToRawData(defaultData(other))
    } : undefined} pdfImport={pdfImport ? {
        ...pdfImport, onImport: onImportPdf, isDangerous, defaultData: () => dataToRawData(defaultData(other))
    } : undefined} store={storedData} {t} title={title(t, mode, other)}
                showBackButton={mode === 'view' || !$buttonsStore.hideBack} />
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
                {#if !result.load && !$buttonsStore.hideSave}
                    <button onclick={save(false, false)} class="mb-auto btn btn-success">
                        <Icon icon="save" /> {t.form.save}
                    </button>
                {/if}
                {#if !result.load && $buttonsStore.saveAndSendAgain}
                    <button onclick={save(true, false)} class="mb-auto btn btn-success text-nowrap">
                        <Icon icon="save" /> <Icon icon="send" /> {t.form.saveAndSendAgain}
                    </button>
                {/if}
                {#if !result.load && $buttonsStore.saveAndSend}
                    <button onclick={save(true, false)} class="mb-auto btn btn-success text-nowrap">
                        <Icon icon="save" /> <Icon icon="send" /> {t.form.saveAndSend}
                    </button>
                {/if}
                {#if !result.load && $buttonsStore.send}
                    <button onclick={save(true, false)} class="mb-auto btn btn-success text-nowrap">
                        <Icon icon="send" /> {t.form.send}
                    </button>
                {/if}
                {#if !result.load && $buttonsStore.saveAsDraft}
                    <button onclick={save(false, true)} class="mb-auto btn btn-secondary text-nowrap">
                        <Icon icon="design_services" /> {t.form.saveAsDraft}
                    </button>
                {/if}
                {#if result.load}
                    <div class="spinner-border text-danger"></div>
                {/if}
                {#if !result.load && !$buttonsStore.hideBack}
                    <button type="button" class="mb-auto btn btn-secondary" onclick={() => history.back()}>
                        {t.form.back}
                    </button>
                {/if}
            {/if}
        </div>
        <p class:text-danger={result.red} class="my-auto">{@html result.text}</p>
    </div>
{/if}
