<script generics="D, F extends Form<D>, S extends unknown[][]" lang="ts">
    // noinspection ES6UnusedImports
    import type { Form } from '$lib/forms/Form';
    import { dataToRawData, type Raw, rawDataToData } from '$lib/forms/Form';
    import type { Translations } from '$lib/translations';
    import type { DetachedFormInfo } from '$lib/forms/forms.svelte.js';
    import FormHeader from '$lib/forms/FormHeader.svelte';
    import { onMount, untrack } from 'svelte';
    import { derived as derivedStore, readable } from 'svelte/store';
    import WidgetComponent from '$lib/components/Widget.svelte';
    import { storable } from '$lib/helpers/stores';
    import { page } from '$app/state';
    import { dev } from '$app/environment';
    import { getIsOnline } from '$lib/client/realtime';

    const { t, formInfo }: {
        t: Translations,
        formInfo: DetachedFormInfo<D, F, S>,
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
        isSendingEmails,
        openTabLink,
        redirectLink,
        showBackButton,
        showSaveAndSendButtonByDefault,
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

        await mountEffect?.(d, f, mode == 'edit');

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
        // result = { load: true, red: false, text: '' };
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

            // if (!getIsOnline()) {
            //     result = { red: true, text: t.offline, load: false };
            //     return;
            // }

            result = { load: true, red: false, text: t.saving };
            const success = await saveData(raw, mode == 'edit', f, r => result = r, t, send);

            if (!dev) storedData.set(undefined);

            if (success) {
                result = openTabLink || redirectLink
                    ? { text: t.redirecting, red: false, load: true }
                    : { text: '', red: false, load: false };

                if (openTabLink) {
                    const newWin = window.open(await openTabLink(raw));
                    if (!newWin || newWin.closed) {
                        result = {
                            text: 'Povolte prosím otevírání oken v prohlížeči',
                            red: true, load: false,
                        };
                        return;
                    }
                }

                if (redirectLink) window.location.replace(await redirectLink(raw));
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
    const showSaveAndSendButtonByDefaultStore = $derived(typeof showSaveAndSendButtonByDefault == 'boolean' ? readable(showSaveAndSendButtonByDefault) : showSaveAndSendButtonByDefault);
</script>

<FormHeader importData={importOptions ? {
    ...importOptions, onImport, isDangerous, defaultData: () => dataToRawData(defaultData())
} : undefined} store={storedData} {t} title={title(t, mode === 'edit')} />
{#if mode !== 'loading'}
    {#if subtitle}
        <h3>{subtitle(t, mode === 'edit')}</h3>
    {/if}
    {#each list as _, i}
        <WidgetComponent bind:widget={list[i]} {t} data={d} />
    {/each}
    <div class="d-flex flex-column flex-sm-row align-items-start gap-3">
        <div class="d-flex gap-3 flex-wrap">
            {#if !result.load && (mode === 'edit' && isSendingEmails || !$showSaveAndSendButtonByDefaultStore)}
                <button onclick={save(false)} class="mb-auto btn btn-success">{t.save}</button>
            {/if}
            {#if !result.load && (mode === 'edit' && isSendingEmails || $showSaveAndSendButtonByDefaultStore)}
                <button onclick={save(true)} class="mb-auto btn btn-success text-nowrap">{t.saveAndSend}</button>
            {/if}
            {#if result.load}
                <div class="spinner-border text-danger"></div>
            {/if}
            {#if !result.load && (showBackButton?.(mode === 'edit') ?? true)}
                <button type="button" class="mb-auto btn btn-secondary" onclick={() => history.back()}>
                    {t.back}
                </button>
            {/if}
        </div>
        <p class:text-danger={result.red} class="my-auto">{@html result.text}</p>
    </div>
{:else}
    <div class="spinner-border text-danger m-2"></div>
{/if}
