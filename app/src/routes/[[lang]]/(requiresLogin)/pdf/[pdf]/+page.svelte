<script lang="ts">
    import type { PageProps } from './$types';
    import PdfPage from './PdfPage.svelte';
    import { range } from '$lib/extensions';
    import { browser } from '$app/environment';
    import { downloadFile } from '../../../helpers';
    import { languageNames } from '$lib/translations';
    import { type LanguageCode, setUserPreferredDocumentLanguage } from '$lib/languages';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import LanguageSelector from '$lib/components/nav/LanguageSelector.svelte';

    const {
        data,
    }: PageProps = $props();

    const t = $derived(data.translations.pdf);
    const { title, supportedLanguages } = $derived(data.args!);

    let pageCount = $state(1);
    let pdf = $state<import('pdfjs-dist').PDFDocumentProxy>();

    const displayPdf = async () => {
        if (!browser) return;

        const { GlobalWorkerOptions, getDocument } = await import('pdfjs-dist');

        GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

        pdf = await getDocument(data.url).promise;
        pageCount = pdf.numPages;
    };

    $effect(() => {
        data.fileLang;
        displayPdf();
    });

    const download = async () => downloadFile(data.url, data.fileName);

    const createLink = (code: LanguageCode) => {
        const url = page.url;
        url.searchParams.set('lang', code);
        return url.toString();
    };
</script>

<h2 class="m-0">{title(data.translations)}</h2>
<h4 class="m-0">{data.fileName}</h4>

{#if pdf}
    {#each range(1, pageCount + 1) as pageNumber}
        <div class="d-flex gap-3 align-items-center flex-wrap-reverse">
            {#if pageCount > 1}
                <h5 class="m-0">{t.page({ page: `${pageNumber}`, total: `${pageCount}` })}</h5>
            {/if}
            {#if pageNumber === 1}
                <div class="flex-grow-1"></div>

                <div class="d-flex gap-3 align-items-center flex-wrap">
                    <div class="d-flex align-items-center"><span class="me-1">{t.fileLanguage}:</span>
                        <LanguageSelector onChange={code =>
                            goto(createLink(code), { replaceState: true, invalidateAll: true })
                        } selected={data.fileLang} options={supportedLanguages} />
                    </div>
                    <button class="btn btn-primary" onclick={download}>
                        <span class="material-icons">file_download</span>
                        {t.downloadFile}
                    </button>
                </div>
            {/if}
        </div>
        <PdfPage {pdf} {pageNumber} />
    {/each}
{/if}