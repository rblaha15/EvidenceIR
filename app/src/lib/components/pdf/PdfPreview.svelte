<script lang="ts">
    import { browser } from '$app/environment';
    import { range } from '$lib/extensions';
    import PdfPage from '$lib/components/pdf/PdfPage.svelte';
    import type { Translations } from '$lib/translations';
    import type { Snippet } from 'svelte';

    const {
        url, args, t, children,
    }: {
        url: string,
        args?: any,
        t: Translations['pdf'],
        children?: Snippet,
    } = $props();

    let pageCount = $state(1);
    let pdf = $state<import('pdfjs-dist').PDFDocumentProxy>();

    const displayPdf = async () => {
        if (!browser) return;

        const { GlobalWorkerOptions, getDocument } = await import('pdfjs-dist');

        GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

        pdf = await getDocument(url).promise;
        pageCount = pdf.numPages;
    };

    $effect(() => {
        args;
        url;
        displayPdf();
    });
</script>

{#if pdf}
    {#each range(1, pageCount + 1) as pageNumber}
        <div class="d-flex gap-3 align-items-center flex-wrap-reverse">
            {#if pageCount > 1}
                <h5 class="m-0">{t.page(pageNumber, pageCount)}</h5>
            {/if}
            {#if pageNumber === 1}
                <div class="flex-grow-1"></div>

                <div class="d-flex gap-3 align-items-center flex-wrap">
                    {@render children?.()}
                </div>
            {/if}
        </div>
        <PdfPage {pdf} {pageNumber} />
    {/each}
{/if}