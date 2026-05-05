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

    const phone = $derived(/Android|iPhone|iPad/i.test(navigator.userAgent));
    const download = async () => downloadFile(data.url, data.fileName);
    const print = async () => printFile(data.objectUrl);

    const createLink = (code: LanguageCode) => {
        const url = page.url;
        url.searchParams.set('lang', code);
        return url.toString();
    };

    const signUrl = $derived.by(() => {
        const url = page.url;
        url.pathname += '/sign';
        return url.href;
    });
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
    {#if !data.signatureState}
        <a class="btn btn-primary" href={signUrl}>
            <Icon icon="border_color" />
            Podepsat dokument
        </a>
    {/if}
    {#if data.signatureState?.state == 'signed'}
        <div class="text-success">Dokument podepsán</div>
        <a class="btn btn-secondary" target="_blank"
           href="https://console.firebase.google.com/u/0/project/evidence-ir/firestore/databases/-default-/data/~2Fsigning~2F{data.irid || data.spids[0]}~2Fdocuments~2F{data.signatureKey}"
        >
            <Icon icon="cloud_circle" />
        </a>
    {/if}
    <button class="btn btn-primary" onclick={download}>
        <Icon icon="file_download" />
        {t.downloadFile}
    </button>
    {#if !phone}
        <button class="btn btn-primary" onclick={print}>
            <Icon icon="print" />
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