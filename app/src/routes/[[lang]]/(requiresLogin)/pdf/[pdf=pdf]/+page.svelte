<script lang="ts">
    import { relUrl } from '$lib/helpers/runes.svelte';
    import type { PageProps } from './$types';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import LanguageSelector from '$lib/components/nav/LanguageSelector.svelte';
    import PdfPreview from '$lib/components/pdf/PdfPreview.svelte';
    import type { LanguageCode } from '$lib/languageCodes';
    import { downloadFile, printFile } from '$lib/helpers/files';
    import { FileDown, Printer, Signature, Server } from '@lucide/svelte';
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
        const url = new URL(page.url);
        url.searchParams.set('lang', code);
        return url.toString();
    };

    const signUrl = $derived.by(() => {
        const url = new URL(page.url);
        url.pathname += '/sign';
        return url.href;
    });

    onMount(() => setTitle(t.documentPreview, true));
</script>

<h2>{title(data.translations)}</h2>
<h3>{data.fileName}</h3>

<p class="hidden print:block text-xl text-danger">{t.printWarning}</p>

<PdfPreview args={data.fileLang} {t} url={data.url}>
    <div class="flex items-center gap-1">
        <p>{t.fileLanguage}:</p>
        <LanguageSelector readonly={supportedLanguages.length < 2} onChange={code =>
            goto(createLink(code), { replaceState: true, invalidateAll: true })
        } options={supportedLanguages} selected={data.fileLang} />
    </div>
    {#if data.signatureState?.state != 'signed' && data.allowSigning}
        <Button href={signUrl}>
            <Signature />
            Podepsat dokument
        </Button>
    {/if}
    {#if data.signatureState?.state == 'signed'}
        <div class="text-success">Dokument podepsán</div>
        <Button variant="secondary" target="_blank"
            href={relUrl(`/admin#db-app/signing?query={"def":${JSON.stringify(data.signatureDef)}}`)}
        >
            <Server />
        </Button>
    {/if}
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