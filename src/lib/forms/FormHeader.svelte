<script generics="R extends Raw<Form>" lang="ts">
    import type { Writable } from 'svelte/store';
    import { type P, p, type Translations } from '$lib/translations';
    import { endLoading, setTitle, startLoading } from '$lib/helpers/globals.js';
    import type { Form, Raw } from '$lib/forms/Form';
    import { type ExcelImport, processExcel } from '$lib/forms/ExcelImport';
    import readXlsxFile, { readSheetNames } from 'read-excel-file';
    import { ChooserWidget, STAR } from '$lib/forms/Widget.svelte.js';
    import Widget from '$lib/components/Widget.svelte';
    import { invalidateAll } from '$app/navigation';
    import { type PdfImport, processPdf } from '$lib/forms/PdfImport';
    import { PDFDocument } from 'pdf-lib';

    interface Props<R extends Raw<Form>> {
        title: string;
        hideResetButton?: boolean;
        showBackButton?: boolean;
        excelImport?: ExcelImport<R> & {
            onImport: (data: R) => void;
            isDangerous: boolean;
        };
        pdfImport?: PdfImport<R> & {
            onImport: (data: R) => void;
            isDangerous: boolean;
        };
        store: Writable<unknown | undefined>;
        t: Translations;
        readonly?: boolean;
    }

    let {
        title,
        store,
        excelImport = undefined,
        pdfImport = undefined,
        hideResetButton = false,
        showBackButton = false,
        t,
        readonly,
    }: Props<R> = $props();
    const tf = $derived(t.form)
    const tfi = $derived(tf.import)

    $effect(() => setTitle(title, showBackButton));

    let inputExcel = $state() as HTMLInputElement;
    let inputPdf = $state() as HTMLInputElement;
    let fileExcel = $state<File>();
    let filePdf = $state<File>();
    let sheetWidget = $state(new ChooserWidget({
        options: [] as P[], show: (d): boolean => sheetWidget.options(d).length > 1, label: 'form.import.workbookSheet',
    }));
    let error = $state(false);

    $effect(() => {
        if (fileExcel) readSheetNames(fileExcel).then(names => {
            const sheets = names.filter(excelImport?.sheetFilter ?? (n => n == (excelImport?.sheet ?? n)));
            sheetWidget.options = () => p(sheets);
            if (sheets.length == 1)
                sheetWidget._value = p(sheets[0]);
        }); else {
            sheetWidget._value = null;
            sheetWidget.options = () => [];
        }
    });

    const confirmExcel = async () => {
        error = false;
        if (!excelImport || !fileExcel) return;
        const rows = await readXlsxFile(fileExcel, { ...excelImport, sheet: t.get(sheetWidget.value!) });
        console.log(rows);
        try {
            excelImport.onImport(processExcel<R>(excelImport, rows));
        } catch {
            error = true;
        }
    };

    const confirmPdf = async () => {
        error = false;
        if (!pdfImport || !filePdf) return;
        const pdfDoc = await PDFDocument.load(await filePdf.bytes());
        const form = pdfDoc.getForm();
        try {
            pdfImport.onImport(processPdf<R>(pdfImport, form));
        } catch {
            error = true;
        }
    };
</script>

{#if !readonly}
    <div class="d-flex w-100 align-items-center text-nowrap flex-wrap gap-2">
        <span class="me-auto">{STAR} = {tf.mandatoryFields}</span>
        {#if excelImport || pdfImport}
            <button
                class="btn btn-outline-secondary"
                data-bs-toggle="modal"
                data-bs-target="#import"
            >
                <i class="my-1 bi-upload"></i>
                <span class="ms-2">{tfi.importData}</span>
            </button>
        {/if}
        {#if !hideResetButton}
            <button
                class="btn btn-outline-secondary"
                onclick={async () => {
                    $store = undefined;
                    startLoading()
                    await invalidateAll();
                    endLoading();
                }}
            >
                <i class="my-1 bi-arrow-clockwise"></i>
                <span class="ms-2">{tf.clearForm}</span>
            </button>
        {/if}
    </div>
{/if}

<div class="modal" id="import">
    <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title">{tfi.importData}</h4>
                <button
                    aria-label={tfi.cancel}
                    class="btn-close"
                    data-bs-dismiss="modal"
                    title={tfi.cancel}
                    type="button"
                ></button>
            </div>

            <div class="modal-body gap-3 d-flex flex-column">
                {#if excelImport}
                    <p class="m-0">{tfi.uploadExcel({ sheet: excelImport.sheet })}</p>
                    <input accept=".xls,.xlsx,.xlsm,.xlsb"
                           bind:this={inputExcel}
                           class="d-none"
                           onchange={() => fileExcel = inputExcel?.files?.[0]}
                           type="file">
                    <div class="d-flex align-items-center gap-3">
                        {#if !fileExcel}
                            <button
                                type="button"
                                class="btn btn-primary"
                                onclick={() => inputExcel?.click()}
                            >
                                {tfi.choseFile}
                            </button>
                        {:else}
                            <p class="m-0">{tfi.chosen_File} {fileExcel?.name ?? ''}</p>
                            <button
                                type="button"
                                class="btn btn-info"
                                onclick={() => {inputExcel.value = ''; fileExcel = undefined; inputExcel?.click()}}
                            >
                                {tfi.choseDifferentFile}
                            </button>
                        {/if}
                    </div>
                    <Widget data={undefined} {t} widget={sheetWidget} />
                    {#if fileExcel && excelImport.isDangerous && sheetWidget.value}
                        <p class="alert alert-danger">{tfi.warningDataLoss}</p>
                    {/if}
                {/if}
                {#if pdfImport}
                    <p class="m-0">{tfi.uploadPdf}</p>
                    <input accept="application/pdf"
                           bind:this={inputPdf}
                           class="d-none"
                           onchange={() => filePdf = inputPdf?.files?.[0]}
                           type="file">
                    <div class="d-flex align-items-center gap-3">
                        {#if !filePdf}
                            <button
                                type="button"
                                class="btn btn-primary"
                                onclick={() => inputPdf?.click()}
                            >
                                {tfi.choseFile}
                            </button>
                        {:else}
                            <p class="m-0">{tfi.chosen_File} {filePdf?.name ?? ''}</p>
                            <button
                                type="button"
                                class="btn btn-info"
                                onclick={() => {inputPdf.value = ''; filePdf = undefined; inputPdf?.click()}}
                            >
                                {tfi.choseDifferentFile}
                            </button>
                        {/if}
                    </div>
                    {#if filePdf && pdfImport.isDangerous}
                        <p class="alert alert-danger">{tfi.warningDataLoss}</p>
                    {/if}
                {/if}
                {#if error}
                    <p class="text-error">{tfi.somethingWentWrong}</p>
                {/if}
            </div>

            <div class="modal-footer">
                <button
                    class="btn btn-info"
                    data-bs-dismiss="modal"
                    type="button">{tfi.cancel}</button
                >
                {#if excelImport && fileExcel && sheetWidget.value}
                    <button
                        class="btn"
                        class:btn-danger={excelImport.isDangerous}
                        class:btn-success={!excelImport.isDangerous}
                        data-bs-dismiss="modal"
                        onclick={confirmExcel}
                        type="button">{tfi.confirm}</button
                    >
                {/if}
                {#if pdfImport && filePdf}
                    <button
                        class="btn"
                        class:btn-danger={pdfImport.isDangerous}
                        class:btn-success={!pdfImport.isDangerous}
                        data-bs-dismiss="modal"
                        onclick={confirmPdf}
                        type="button">{tfi.confirm}</button
                    >
                {/if}
            </div>
        </div>
    </div>
</div>
