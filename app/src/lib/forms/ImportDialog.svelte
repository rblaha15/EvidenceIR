<script generics="R extends Raw<Form>" lang="ts">
    // noinspection ES6UnusedImports
    import type { Form, Raw } from '$lib/forms/Form';
    import { type Translations } from '$lib/translations';
    import { type ExcelImport, processExcel } from '$lib/forms/ExcelImport';
    import readXlsxFile, { readSheetNames } from 'read-excel-file';
    import Widget from '$lib/components/Widget.svelte';
    import { type PdfImport, processPdf } from '$lib/forms/PdfImport';
    import { PDFDocument } from 'pdf-lib';
    import type { US } from '$lib/translations/untranslatables';
    import { newChooserWidget } from '$lib/forms/Widget';
    import { OctagonAlert, Upload } from '@lucide/svelte';
    import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "$lib/components/ui/dialog";
    import { Button, buttonVariants } from '$lib/components/ui/button';

    interface Props {
        excelImport?: ExcelImport<R> & {
            onImport: (newData: R) => void;
            isDangerous: boolean;
        };
        pdfImport?: PdfImport<R> & {
            onImport: (newData: R) => void;
            isDangerous: boolean;
        };
        t: Translations;
    }

    let {
        excelImport = undefined,
        pdfImport = undefined,
        t,
    }: Props = $props();
    const ti = $derived(t.form.import)

    let dialogOpened = $state(false);

    let inputExcel = $state() as HTMLInputElement;
    let inputPdf = $state() as HTMLInputElement;
    let fileExcel = $state<File>();
    let filePdf = $state<File>();

    let sheets = $state<US[]>([]);
    const sheetWidget = newChooserWidget({
        options: () => sheets, show: () => sheets.length > 1, label: t => t.form.import.workbookSheet,
    });
    let value = $state(null as US | null);
    let error = $state('');

    $effect(() => {
        if (fileExcel) readSheetNames(fileExcel).then(names => {
            sheets = names.filter(excelImport?.sheetFilter ?? (n => n == (excelImport?.sheet ?? n))) as US[];
            if (sheets.length == 1)
                value = sheets[0];
        }); else {
            value = null;
            sheets = [];
        }
    });

    const confirmExcel = async () => {
        error = '';
        if (!excelImport || !fileExcel) return;
        const rows = await readXlsxFile(fileExcel, { ...excelImport, sheet: value! });
        console.log(rows);
        try {
            excelImport.onImport(processExcel<R>(excelImport, rows));
            dialogOpened = false;
        } catch (e) {
            console.error(e);
            error = e?.toString() || '';
        }
    };

    const confirmPdf = async () => {
        error = '';
        if (!pdfImport || !filePdf) return;
        const pdfDoc = await PDFDocument.load(await filePdf.bytes());
        const form = pdfDoc.getForm();
        try {
            pdfImport.onImport(processPdf<R>(pdfImport, form));
            dialogOpened = false;
        } catch (e) {
            console.error(e);
            error = e?.toString() || '';
        }
    };
</script>

<Dialog>
    <DialogTrigger class={buttonVariants({ variant: 'outline' })}>
        <Upload />
        {ti.importData}
    </DialogTrigger>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>{ti.importData}</DialogTitle>
        </DialogHeader>
        <div class="flex flex-col gap-4">
            {#if excelImport}
                <p class="m-0">{ti.uploadExcel({sheet: excelImport.sheet})}</p>
                <input accept=".xls,.xlsx,.xlsm,.xlsb"
                       bind:this={inputExcel}
                       class="hidden"
                       onchange={() => fileExcel = inputExcel?.files?.[0]}
                       type="file">
                <div class="flex items-center gap-4">
                    {#if !fileExcel}
                        <button
                            type="button"
                            class="btn btn-primary"
                            onclick={() => inputExcel?.click()}
                        >
                            {ti.choseFile}
                        </button>
                    {:else}
                        <p class="m-0">{ti.chosen_File} {fileExcel?.name ?? ''}</p>
                        <button
                            type="button"
                            class="btn btn-info"
                            onclick={() => {inputExcel.value = ''; fileExcel = undefined; inputExcel?.click()}}
                        >
                            {ti.choseDifferentFile}
                        </button>
                    {/if}
                </div>
                <Widget context={undefined} bind:value {t} widget={sheetWidget} showAllErrors={false} />
                {#if fileExcel && excelImport.isDangerous && value}
                    <p class="alert alert-danger">{ti.warningDataLoss}</p>
                {/if}
            {/if}
            {#if pdfImport}
                <p class="m-0">{ti.uploadPdf}</p>
                <input accept="application/pdf"
                       bind:this={inputPdf}
                       class="hidden"
                       onchange={() => filePdf = inputPdf?.files?.[0]}
                       type="file">
                <div class="flex items-center gap-4">
                    {#if !filePdf}
                        <button
                            type="button"
                            class="btn btn-primary"
                            onclick={() => inputPdf?.click()}
                        >
                            {ti.choseFile}
                        </button>
                    {:else}
                        <p class="m-0">{ti.chosen_File} {filePdf?.name ?? ''}</p>
                        <button
                            type="button"
                            class="btn btn-info"
                            onclick={() => {inputPdf.value = ''; filePdf = undefined; inputPdf?.click()}}
                        >
                            {ti.choseDifferentFile}
                        </button>
                    {/if}
                </div>
                {#if filePdf && pdfImport.isDangerous}
                    <p class="alert alert-danger">{ti.warningDataLoss}</p>
                {/if}
            {/if}
            {#if error}
                <div class="alert alert-danger flex flex-col gap-4">
                    <div class="flex items-center gap-4">
                        <OctagonAlert />
                        <h4 class="alert-heading m-0">{ti.somethingWentWrong}</h4>
                    </div>
                    <p class="m-0">{error}</p>
                </div>
            {/if}
        </div>
        <DialogFooter>
            <DialogClose class={buttonVariants({ variant: 'secondary' })}>
                {ti.cancel}
            </DialogClose>
            {#if excelImport && fileExcel && value}
                <Button
                    variant={excelImport.isDangerous ? 'destructive' : 'default'}
                    onclick={confirmExcel}
                >{ti.confirm}</Button>
            {/if}
            {#if pdfImport && filePdf}
                <Button
                    variant={pdfImport.isDangerous ? 'destructive' : 'default'}
                    onclick={confirmPdf}
                >{ti.confirm}</Button>
            {/if}
        </DialogFooter>
    </DialogContent>
</Dialog>