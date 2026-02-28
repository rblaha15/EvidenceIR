<script lang="ts">
    import type { PageProps } from './$types';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import LanguageSelector from '$lib/components/nav/LanguageSelector.svelte';
    import PdfPreview from '$lib/components/pdf/PdfPreview.svelte';
    import Icon from '$lib/components/Icon.svelte';
    import type { LanguageCode } from '$lib/languageCodes';
    import { downloadFile, printFile } from '$lib/helpers/files';

    const {
        data,
    }: PageProps = $props();

    const t = $derived(data.translations.pdf);
    const { title, supportedLanguages } = $derived(data.args!);

    const download = async () => downloadFile(data.url, data.fileName);
    const print = async () => printFile(data.objectUrl);

    const createLink = (code: LanguageCode) => {
        const url = page.url;
        url.searchParams.set('lang', code);
        return url.toString();
    };
</script>

<h2 class="m-0">{title(data.translations)}</h2>
<h4 class="m-0">{data.fileName}</h4>

<p class="m-0 d-none print-warning fs-2 text-danger">{t.printWarning}</p>

<PdfPreview args={data.fileLang} {t} url={data.url}>
    <div class="d-flex align-items-center"><span class="me-1">{t.fileLanguage}:</span>
        <LanguageSelector readonly={supportedLanguages.length < 2} onChange={code =>
            goto(createLink(code), { replaceState: true, invalidateAll: true })
        } options={supportedLanguages} selected={data.fileLang} />
    </div>
    <button class="btn btn-primary" onclick={download}>
        <Icon icon="file_download" />
        {t.downloadFile}
    </button>
    <button class="btn btn-primary" onclick={print}>
        <Icon icon="print" />
        {t.printFile}
    </button>
</PdfPreview>

<style>
    @media print {
        .print-warning {
            display: block !important;
        }
    }
</style>