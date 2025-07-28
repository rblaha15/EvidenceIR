<script lang="ts">
    import type { PageProps } from './$types';
    import PdfPage from './PdfPage.svelte';
    import { range } from '$lib/extensions';
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { downloadFile } from '../../../helpers';

    const {
        data,
    }: PageProps = $props();

    const t = data.translations

    let pageCount = $state(1);
    let pdf = $state<import('pdfjs-dist').PDFDocumentProxy>();

    onMount(async () => {
        if (!browser) return;

        const { GlobalWorkerOptions, getDocument } = await import('pdfjs-dist');

        GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

        pdf = await getDocument(data.url).promise;
        pageCount = pdf.numPages;
    });

    const download = async () => downloadFile(data.url, data.fileName);
</script>

<h2 class="m-0">{data.title}</h2>
<h4 class="m-0">{data.fileName}</h4>

{#if pdf}
    {#each range(1, pageCount + 1) as pageNumber}
        <div class="d-flex gap-3 align-items-center flex-wrap-reverse">
            {#if pageCount > 1}
                <h5 class="m-0">{t.pdf.page({ page: `${pageNumber}`, total: `${pageCount}` })}</h5>
            {/if}
            {#if pageNumber === 1}
                <div class="flex-grow-1"></div>
                <button class="btn btn-primary" onclick={download}><i class="bi-download me-2"></i>{t.pdf.downloadFile}</button>
            {/if}
        </div>
        <PdfPage {pdf} {pageNumber} />
    {/each}
{/if}