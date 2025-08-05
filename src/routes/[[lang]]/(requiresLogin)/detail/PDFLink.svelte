<script generics="P extends Pdf" lang="ts">
    import { languageNames, type Translations } from '$lib/translations';
    import { type DataOfPdf, type OpenPdfOptions, type Pdf, pdfInfo } from '$lib/pdf/pdf';
    import type { Snippet } from 'svelte';
    import { generatePdfUrl } from '$lib/pdf/pdfGeneration';
    import type { LanguageCode } from '$lib/languages';
    import { withLoading } from '$lib/helpers/globals.js';
    import { goto } from '$app/navigation';
    import { downloadFile, generatePdfPreviewUrl } from '../../helpers';

    type Props<P extends Pdf> = OpenPdfOptions<P> & {
        data: DataOfPdf<P>;
        name?: string;
        lang: LanguageCode;
        t: Translations;
        enabled?: boolean;
        hideLanguageSelector?: boolean;
        children?: Snippet;
        dropdown?: Snippet;
        breakpoint?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | '';
    }

    const {
        name,
        t,
        enabled = true,
        hideLanguageSelector = false,
        children,
        dropdown,
        breakpoint = 'sm',
        data,
        ...options
    }: Props<P> = $props();

    const o = $derived(options as unknown as OpenPdfOptions<P>);
    const { link } = $derived(o);
    const { lang } = $derived(options);

    const pdf = $derived(pdfInfo[link]);
    const defaultLanguage = $derived(lang && pdf.supportedLanguages.includes(lang)
        ? lang
        : pdf.supportedLanguages[0]);

    const downloadPdf = withLoading(async (lang: LanguageCode = defaultLanguage) => {
        const pdfData = await generatePdfUrl({ ...o, args: pdf, lang, data });
        downloadFile(pdfData.url, pdfData.fileName);
    });

    const previewPdf = withLoading((lang: LanguageCode = defaultLanguage) =>
        goto(generatePdfPreviewUrl({ ...o, lang }))
    );
</script>

<div
    class="d-flex flex-column flex-{breakpoint}-row align-items-{breakpoint}-center gap-1 gap-{breakpoint}-3">
    {#if name}<span>{name}</span>{/if}
    <div class="d-flex align-items-center gap-3 flex-wrap flex-{breakpoint}-nowrap">
        {#if enabled}
            <div class="btn-group">
                <button
                    tabindex={enabled ? 0 : undefined}
                    type="button"
                    onclick={() => downloadPdf()}
                    class:disabled={!enabled}
                    class="btn btn-info text-nowrap"
                >{t.pdf.download}</button>
                <button
                    tabindex={enabled ? 0 : undefined}
                    type="button"
                    onclick={() => previewPdf()}
                    class:disabled={!enabled}
                    class="btn btn-info text-nowrap"
                >{t.pdf.preview}</button>
                {#if !hideLanguageSelector}
                    <button
                        disabled={!enabled || pdf.supportedLanguages.length === 1}
                        class="btn btn-outline-secondary flex-grow-0 dropdown-toggle"
                        data-bs-toggle="dropdown"
                    >
                        <span>{defaultLanguage.toUpperCase()}</span>
                    </button>
                    {#if pdf.supportedLanguages.length > 1}
                        <ul class="dropdown-menu">
                            {#each pdf.supportedLanguages as code}
                                <li>
                                    <button
                                        tabindex="0"
                                        class="dropdown-item d-flex align-items-center"
                                        onclick={() => downloadPdf(code)}
                                    >
                                        <span class="fs-6 me-2">{code.toUpperCase()}</span>
                                        {languageNames[code]}
                                    </button>
                                </li>
                            {/each}
                        </ul>
                    {/if}
                {/if}
                {#if dropdown}
                    <button type="button" class="btn btn-outline-secondary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
                        <span class="visually-hidden">Toggle Dropdown</span>
                    </button>
                    <ul class="dropdown-menu">
                        {@render dropdown?.()}
                    </ul>
                {/if}
            </div>
        {/if}
        {@render children?.()}
    </div>
</div>