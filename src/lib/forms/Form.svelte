<script generics="D, F extends Form<D>, S extends unknown[][]" lang="ts">
    // noinspection ES6UnusedImports
    import type { Form } from '$lib/forms/Form';
    import { dataToRawData, type Raw, rawDataToData } from '$lib/forms/Form';
    import type { Translations } from '$lib/translations';
    import type { DetachedFormInfo } from '$lib/forms/forms.svelte.js';
    import FormHeader from '$lib/forms/FormHeader.svelte';
    import { onMount, untrack } from 'svelte';
    import { derived as derivedStore } from 'svelte/store';
    import WidgetComponent from '$lib/components/Widget.svelte';
    import { storable } from '$lib/helpers/stores';
    import { page } from '$app/state';
    import { dev } from '$app/environment';

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
            derivedStore(stores, values => values).subscribe(values => callback(d, f, values));
        });
    });

    let result = $state({
        text: '',
        red: false,
        load: false
    });

    const list = $derived(f.getValues().flatMap(obj => obj.getValues()));
    const d = $derived(createWidgetData(f));

    const save = (send: boolean) => async () => {
        try {
            const raw = dataToRawData(f);
            const errors = list.filter(w => w.isError(d) && w.show(d)).map(w => t.get(w.label(d, t)))
            if (errors.length > 0) {
                for (const i in list) {
                    list[i].displayErrorVeto = true;
                }
                result = {
                    red: true,
                    text: t.youHaveAMistake.parseTemplate({ fields: errors.join(', ') }),
                    load: false
                };
                return;
            }

            result = { load: true, red: false, text: t.saving };
            const success = await saveData(raw, mode == 'edit', f, r => result = r, t, send);

            if (!dev) storedData.set(undefined);

            if (success) {
                result = {
                    text: t.redirecting,
                    red: false,
                    load: true
                };

                if (openTabLink) {
                    const newWin = window.open(await openTabLink(raw));
                    if (!newWin || newWin.closed) {
                        result = {
                            text: 'Povolte prosím otevírání oken v prohlížeči',
                            red: true, load: false,
                        };
                        return
                    }
                }

                if (redirectLink) window.location.replace(await redirectLink(raw));
                if (redirectLink) setTimeout(async () => result = {
                    text: t.redirectFailedHtml.parseTemplate({ link: page.url.origin + await redirectLink(raw) }),
                    red: true,
                    load: false
                }, 5000);
            }
        } catch (e) {
            console.log(e);
            result = {
                red: true,
                text: t.somethingWentWrongContactUsHtml,
                load: false
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
</script>

{#if mode !== 'loading'}
    <FormHeader store={storedData} {t} title={title(t, mode === 'edit')} importData={importOptions ? {
        ...importOptions, onImport, isDangerous, defaultData: () => dataToRawData(defaultData())
    } : undefined} />
    {#if subtitle}
        <h3>{subtitle(t, mode === 'edit')}</h3>
    {/if}
    {#each list as _, i}
        <WidgetComponent bind:widget={list[i]} {t} data={d} />
    {/each}
    <div class="d-inline-flex align-content-center">
        {#if !result.load}
            <button onclick={save(false)} class="mb-auto btn btn-success">{t.save}</button>
        {/if}
        {#if !result.load && mode === 'edit' && isSendingEmails}
            <button onclick={save(true)} class="mb-auto btn btn-success ms-2 text-nowrap">{t.saveAndSend}</button>
        {/if}
        {#if result.load}
            <div class="spinner-border text-danger ms-2"></div>
        {/if}
        {#if showBackButton}
            <button type="button" class="mb-auto btn btn-secondary ms-2" onclick={() => history.back()}>
                {t.back}
            </button>
        {/if}
        <p class:text-danger={result.red} class="ms-2 my-auto">{@html result.text}</p>
    </div>
{:else}
    <div class="spinner-border text-danger m-2"></div>
{/if}
