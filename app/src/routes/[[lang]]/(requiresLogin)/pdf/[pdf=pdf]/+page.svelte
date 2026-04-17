<script lang="ts">
    import type { PageProps } from './$types';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import LanguageSelector from '$lib/components/nav/LanguageSelector.svelte';
    import PdfPreview from '$lib/components/pdf/PdfPreview.svelte';
    import type { LanguageCode } from '$lib/languageCodes';
    import { downloadFile, printFile } from '$lib/helpers/files';
    import { FileDown, Printer } from '@lucide/svelte';
    import { onMount } from "svelte";
    import { setTitle } from "$lib/helpers/globals";

    const {
        data,
    }: PageProps = $props();

    const t = $derived(data.translations.pdf);
    const { title, supportedLanguages } = $derived(data.args!);

    const phone = $derived(/Android|iPhone|iPad/i.test(navigator.userAgent));
    const download = async () => downloadFile(data.url, data.fileName);
    const print = async () => printFile(data.objectUrl);

    const createLink = (code: LanguageCode) => {
        const url = page.url;
        url.searchParams.set('lang', code);
        return url.toString();
    };

    onMount(() => setTitle(t.documentPreview, true));
</script>

<h2 class="m-0">{title(data.translations)}</h2>
<h4 class="m-0">{data.fileName}</h4>

<p class="m-0 hidden print-warning text-xl text-danger">{t.printWarning}</p>

<PdfPreview args={data.fileLang} {t} url={data.url}>
    <div class="flex items-center"><span class="me-1">{t.fileLanguage}:</span>
        <LanguageSelector readonly={supportedLanguages.length < 2} onChange={code =>
            goto(createLink(code), { replaceState: true, invalidateAll: true })
        } options={supportedLanguages} selected={data.fileLang} />
    </div>
    <button class="btn btn-primary" onclick={download}>
        <FileDown />
        {t.downloadFile}
    </button>
    {#if !phone}
        <button class="btn btn-primary" onclick={print}>
            <Printer />
            {t.printFile}
        </button>
    {/if}
</PdfPreview>

<style>
    @media print {
        .print-warning {
            display: block !important;
        }
    }
</style>