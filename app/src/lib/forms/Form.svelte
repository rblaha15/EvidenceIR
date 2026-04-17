<script generics="
    C,
    F extends Form<C>,
    S extends unknown[][],
    P extends Pdf = Pdf,
    O extends Record<string, unknown> = Record<never, unknown>,
" lang="ts">
    // noinspection ES6UnusedImports
    import {
        compareValues,
        defaultValues,
        type Form,
        type Raw,
        rawDataToValues,
        type Values,
        valuesToRawData,
        widgetList,
    } from '$lib/forms/Form';
    // noinspection ES6UnusedImports
    import { type Pdf } from '$lib/pdf/pdf';
    import type { Translations } from '$lib/translations';
    import FormHeader from '$lib/forms/FormHeader.svelte';
    import { onMount, untrack } from 'svelte';
    import { derived as derivedStore, type Readable, readable } from 'svelte/store';
    import WidgetComponent from '$lib/components/Widget.svelte';
    import { storable } from '$lib/helpers/stores';
    import { dev } from '$app/environment';
    import { type ButtonKey, buttonKeys, type IndependentFormInfo, type Mode, type ModeL, type Result } from '$lib/forms/FormInfo';
    import { refreshTOC, runLoading } from '$lib/helpers/globals.js';
    import ReadonlyWidget from '$lib/components/ReadonlyWidget.svelte';
    import { goto } from '$app/navigation';
    import { relUrl } from '$lib/helpers/runes.svelte';
    import { generatePdfPreviewUrl } from '$lib/helpers/files';
    import Button from '$lib/components/Button.svelte';
    import { PencilRuler, Save, SendHorizonal } from "@lucide/svelte";

    const { t, formInfo, editData, viewData, other }: {
        t: Translations,
        formInfo: IndependentFormInfo<C, F, S, P, O>,
        editData: Raw<F> | undefined,
        viewData: Raw<F> | undefined,
        other: O,
    } = $props();

    const {
        storeName,
        form: formDefinition,
        saveData,
        createContext,
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
    let mode: ModeL = $state('loading');

    const form: F = formDefinition(other);
    let values: Values<F> = $state(defaultValues(form));
    let showAllErrors = $state(false);
    const list = $derived(widgetList<C, F>(form, values));
    const context = $derived(createContext({ form, other, values, mode })) as C;

    onMount(async () => {
        await runLoading(async () => {
            if (viewData) {
                values = rawDataToValues(form, viewData);
                mode = 'view';
            } else if (editData) {
                values = rawDataToValues(form, editData);
                mode = 'edit';
            } else if ($storedData) {
                values = rawDataToValues(form, $storedData);
                mode = 'create';
            } else
                mode = 'create';
        });

        await mountEffect?.({ mode: mode as Mode, context, other, values });

        storeEffects?.forEach(([callback, stores]) => {
            derivedStore(stores, values => values).subscribe(storeValues => callback(
                storeValues, { context, values, edit: mode === 'edit', t }
            ));
        });
    });

    let result = $state<Result>({
        text: '',
        red: false,
        load: false,
    });

    $effect(() => {
        list
            .map(w => w.widget)
            .filter(w => w.widgetType == 'title')
            .filter(w => w.show(context))
            .map(w => w.text(t, context))
            .awaitAll()
            .then(refreshTOC);
    });

    const save = (send: boolean, draft: boolean) => async () => {
        try {
            const raw = valuesToRawData(form, values);
            const errors = list
                .filter(({ widget, value }) => widget.isError(context, value) && widget.show(context))
                .map(({ widget }) => widget.label(t, context));
            if (errors.length > 0 && !draft) {
                showAllErrors = true;
                result = {
                    red: true,
                    text: t.form.youHaveAMistake,
                    load: false,
                    error: errors.join('\n'),
                };
                return;
            }

            result = { load: true, red: false, text: t.form.saving };
            const success = await saveData({
                form, raw, other, draft, edit: mode == 'edit', send, t,
                resetForm() { values = defaultValues(form) },
                editResult: r => result = r, context, values,
            });

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
                error: `${e}`,
            };
        }
    };

    $effect(() => {
        if (mode == 'create') {
            storedData.set((storeData ?? valuesToRawData)(form, values, other));
        }
    });

    const onImportExcel = (newData: Raw<F>) => {
        values = rawDataToValues(form, newData);
        showAllErrors = true;
        excelImport!.onImport(context, values, other);
    };

    const onImportPdf = (newData: Raw<F>) => {
        values = rawDataToValues(form, newData);
        showAllErrors = true;
        pdfImport!.onImport(context, values, other);
    };

    const isDangerous = $derived(compareValues(values, untrack(() => defaultValues(form))));
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
        ...excelImport, onImport: onImportExcel, isDangerous, defaultData: () => valuesToRawData(form, defaultValues(form))
    } : undefined} pdfImport={pdfImport ? {
        ...pdfImport, onImport: onImportPdf, isDangerous, defaultData: () => valuesToRawData(form, defaultValues(form))
    } : undefined} store={storedData} {t} title={title(t, mode, other)}
                showBackButton={mode === 'view' || !$buttonsStore.hideBack} />
    {#each list as item}
        {#if mode === 'view'}
            <ReadonlyWidget widget={item.widget} value={item.value} {t} {context} />
        {:else}
            <WidgetComponent widget={item.widget} bind:value={item.value} {t} {context} {showAllErrors} />
        {/if}
    {/each}
    <div class="flex flex-col items-start gap-4">
        <div class="flex gap-4 flex-wrap">
            {#if mode !== 'view'}
                {#if !result.load && !$buttonsStore.hideSave}
                    <Button text={t.form.save} icon={Save}
                            class="mb-auto" onclick={save(false, false)} />
                {/if}
                {#if !result.load && $buttonsStore.saveAndSendAgain}
                    <Button text={t.form.saveAndSendAgain} icons={[Save, SendHorizonal]}
                            class="mb-auto" onclick={save(true, false)} />
                {/if}
                {#if !result.load && $buttonsStore.saveAndSend}
                    <Button text={t.form.saveAndSend} icons={[Save, SendHorizonal]}
                            class="mb-auto" onclick={save(true, false)} />
                {/if}
                {#if !result.load && $buttonsStore.send}
                    <Button text={t.form.send} icon={SendHorizonal}
                            class="mb-auto" onclick={save(true, false)} />
                {/if}
                {#if !result.load && $buttonsStore.saveAsDraft}
                    <Button text={t.form.saveAsDraft} icon={PencilRuler} variant="secondary"
                            class="mb-auto" onclick={save(false, true)} />
                {/if}
                {#if result.load}
                    <div class="spinner-border text-danger" aria-label="loading"></div>
                {/if}
                {#if !result.load && !$buttonsStore.hideBack}
                    <Button text={t.form.back} variant="secondary"
                            class="mb-auto" onclick={() => history.back()} />
                {/if}
            {/if}
        </div>
        <p class:text-danger={result.red} class="my-auto">{@html result.text}</p>
        {#if result.error}
            <p class="alert alert-danger w-full">
                {#each result.error.split('\n') as line, i}
                    {#if i !== 0}<br />{/if}
                    {line}
                {/each}
            </p>
        {/if}
    </div>
{/if}
