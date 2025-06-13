<script generics="R extends Raw<Form>" lang="ts">
    import type { Writable } from 'svelte/store';
    import { type P, p, type Translations } from '$lib/translations';
    import { setTitle } from '$lib/helpers/title.svelte.js';
    import type { Form, Raw } from '$lib/forms/Form';
    import { type ExcelImport, processExcel } from '$lib/forms/Import';
    import readXlsxFile, { readSheetNames } from 'read-excel-file';
    import { ChooserWidget, STAR } from '$lib/Widget.svelte';
    import Widget from '$lib/components/Widget.svelte';

    interface Props<R extends Raw<Form>> {
        title: string;
        showResetButton?: boolean;
        importData?: ExcelImport<R> & {
            onImport: (data: R) => void;
            isDangerous: boolean;
        };
        store: Writable<unknown | undefined>;
        t: Translations;
    }

    let {
        title,
        store,
        importData = undefined,
        showResetButton = true,
        t,
    }: Props<R> = $props();

    $effect(() => {
        setTitle(title);
    });

    let input: HTMLInputElement;
    let file = $state<File>();
    let sheetWidget = $state(new ChooserWidget({
        options: [] as P[], show: (d): boolean => sheetWidget.options(d).length > 1, label: p('List sešitu'),
    }));

    $effect(() => {
        if (file) readSheetNames(file).then(names => {
            const sheets = names.filter(importData?.sheetFilter ?? (n => n == (importData?.sheet ?? n)));
            sheetWidget.options = () => sheets.map(p)
            if (sheets.length == 1)
                sheetWidget._value = p(sheets[0])
        }); else {
            sheetWidget._value = null;
            sheetWidget.options = () => [];
        }
    });

    const confirm = async () => {
        if (!importData || !file) return;
        const rows = await readXlsxFile(file, { ...importData, sheet: t.get(sheetWidget.value!) });
        console.log(rows);
        importData.onImport(processExcel<R>(importData, rows));
    };
</script>

<div class="d-flex w-100 align-items-center text-nowrap flex-wrap gap-2">
    <span class="me-auto">{STAR} = {t.mandatoryFields}</span>
    {#if importData}
        <button
            class="btn btn-outline-secondary"
            data-bs-toggle="modal"
            data-bs-target="#import"
        >
            <i class="my-1 bi-upload"></i>
            <span class="ms-2">{t.importData}</span>
        </button>
    {/if}
    {#if showResetButton}
        <button
            class="btn btn-outline-secondary"
            onclick={() => {
                $store = undefined;
                window.location.reload();
            }}
        >
            <i class="my-1 bi-arrow-clockwise"></i>
            <span class="ms-2">{t.emptyForm}</span>
        </button>
    {/if}
</div>

<div class="modal" id="import">
    <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title">{t.importData}</h4>
                <button
                    aria-label={t.cancel}
                    class="btn-close"
                    data-bs-dismiss="modal"
                    title={t.cancel}
                    type="button"
                ></button>
            </div>

            <div class="modal-body gap-3 d-flex flex-column">
                <p class="m-0">Nahrajte původní MS Excel sešit s vyplněnými údaji na listu {importData?.sheet}</p>
                <input accept=".xls,.xlsx,.xlsm,.xlsb"
                       bind:this={input}
                       class="d-none"
                       onchange={() => file = input?.files?.[0]}
                       type="file">
                <div class="d-flex align-items-center gap-3">
                    {#if !file}
                        <button
                            type="button"
                            class="btn btn-primary"
                            onclick={() => input?.click()}
                        >
                            Vybrat soubor
                        </button>
                    {:else}
                        <p class="m-0">{t.chosenFile} {file?.name ?? ''}</p>
                        <button
                            type="button"
                            class="btn btn-info"
                            onclick={() => {input.value = ''; file = undefined; input?.click()}}
                        >
                            Vybrat jiný soubor
                        </button>
                    {/if}
                </div>
                <Widget data={undefined} {t} widget={sheetWidget} />
                {#if file && importData?.isDangerous}
                    <p class="alert alert-danger">Pozor! Potvrzením přepíšete všechna zatím vyplněná data!</p>
                {/if}
            </div>

            <div class="modal-footer">
                <button
                    class="btn btn-info"
                    data-bs-dismiss="modal"
                    type="button">{t.cancel}</button
                >
                {#if importData && file && sheetWidget.value}
                    <button
                        class="btn"
                        class:btn-danger={importData.isDangerous}
                        class:btn-success={!importData.isDangerous}
                        data-bs-dismiss="modal"
                        onclick={confirm}
                        type="button">{t.confirm}</button
                    >
                {/if}
            </div>
        </div>
    </div>
</div>
