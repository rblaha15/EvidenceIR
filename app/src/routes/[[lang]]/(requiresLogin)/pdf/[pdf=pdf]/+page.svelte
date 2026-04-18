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
    import { Button } from "$lib/components/ui/button";

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

<h2>{title(data.translations)}</h2>
<h3>{data.fileName}</h3>

<p class="hidden print:block text-xl text-destructive">{t.printWarning}</p>

<PdfPreview args={data.fileLang} {t} url={data.url}>
    <div class="flex items-center gap-1">
        <p>{t.fileLanguage}:</p>
        <LanguageSelector readonly={supportedLanguages.length < 2} onChange={code =>
            goto(createLink(code), { replaceState: true, invalidateAll: true })
        } options={supportedLanguages} selected={data.fileLang} />
    </div>
    <Button onclick={download}>
        <FileDown />
        {t.downloadFile}
    </Button>
    {#if !phone}
        <Button onclick={print}>
            <Printer />
            {t.printFile}
        </Button>
    {/if}
</PdfPreview>