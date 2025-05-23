<script generics="R extends Raw<Form>" lang="ts">
    import type { Writable } from 'svelte/store';
    import type { Translations } from '$lib/translations';
    import { setTitle } from '$lib/helpers/title.svelte.js';
    import type { Form, Raw } from '$lib/forms/Form';
    import { type ExcelImport, processExcel } from '$lib/forms/Import';
    import readXlsxFile from 'read-excel-file';
    import { STAR } from "$lib/Widget.svelte";

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
    let file: string = $state('');

    const confirm = async () => {
        if (!importData || !input.files) return;
        const rows = await readXlsxFile(input.files[0], importData);
        console.log(rows);
        importData.onImport(processExcel<R>(importData, rows));
    };
</script>

<div class="d-flex w-100 align-items-center text-nowrap flex-wrap">
    <span class="me-auto" style="padding: 0.375rem 0.75rem">{STAR} = {t.mandatoryFields}</span>
    {#if importData}
        <button
            class="btn"
            data-bs-toggle="modal"
            data-bs-target="#import"
        >
            <i class="my-1 bi-upload"></i>
            <span class="ms-2">{t.importData}</span>
        </button>
    {/if}
    {#if showResetButton}
        <button
            class="btn"
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

            <div class="modal-body">
                <p>Nahrajte původní MS Excel sešit s vyplněnými údaji na listu {importData?.sheet}</p>
                <input accept=".xls,.xlsx,.xlsm,.xlsb"
                       bind:this={input}
                       onchange={() => file = input?.files?.[0]?.name ?? ''}
                       style="display: none;"
                       type="file">
                <div class="d-flex align-items-center">
                    {#if !file}
                        <button
                            type="button"
                            class="btn btn-primary"
                            onclick={() => input?.click()}
                        >
                            Vybrat soubor
                        </button>
                    {:else}
                        <p class="m-0">{t.chosenFile} {file}</p>
                        <button
                            type="button"
                            class="btn btn-info mt-2 ms-md-2 mt-md-0"
                            onclick={() => {input.value = ''; file = ''; input?.click()}}
                        >
                            Vybrat jiný soubor
                        </button>
                    {/if}
                </div>
                {#if file && importData?.isDangerous}
                    <p class="alert alert-danger mt-2">Pozor! Potvrzením přepíšete všechna zatím vyplněná data!</p>
                {/if}
            </div>

            <div class="modal-footer">
                <button
                    class="btn btn-info"
                    data-bs-dismiss="modal"
                    type="button">{t.cancel}</button
                >
                {#if importData && file}
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
