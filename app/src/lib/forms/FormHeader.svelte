<script generics="R extends Raw<Form>" lang="ts">
    // noinspection ES6UnusedImports
    import type { Form, Raw } from '$lib/forms/Form';
    import type { Writable } from 'svelte/store';
    import { type Translations } from '$lib/translations';
    import { endLoading, setTitle, startLoading } from '$lib/helpers/globals.js';
    import { type ExcelImport } from '$lib/forms/ExcelImport';
    import { invalidateAll } from '$app/navigation';
    import { type PdfImport } from '$lib/forms/PdfImport';
    import { STAR } from '$lib/forms/Widget';
    import { Eraser } from '@lucide/svelte';
    import { onMount } from "svelte";
    import ImportDialog from "$lib/forms/ImportDialog.svelte";
    import { Button } from "$lib/components/ui/button";

    interface Props {
        title: string;
        hideResetButton?: boolean;
        showBackButton?: boolean;
        excelImport?: ExcelImport<R> & {
            onImport: (newData: R) => void;
            isDangerous: boolean;
        };
        pdfImport?: PdfImport<R> & {
            onImport: (newData: R) => void;
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
    }: Props = $props();
    const tf = $derived(t.form)

    onMount(() => setTitle(title, showBackButton));
</script>

{#if !readonly}
    <div class="flex w-full items-center text-nowrap flex-wrap gap-2">
        <span class="me-auto">{STAR} = {tf.mandatoryFields}</span>
        {#if excelImport || pdfImport}
            <ImportDialog {excelImport} {pdfImport} {t} />
        {/if}
        {#if !hideResetButton}
            <Button variant="outline" onclick={async () => {
                $store = undefined;
                startLoading()
                await invalidateAll();
                endLoading();
            }}>
                <Eraser />
                {tf.clearForm}
            </Button>
        {/if}
    </div>
{/if}