<script generics="P extends Pdf" lang="ts">
    import { languageNames, type Translations } from '$lib/translations';
    import { type Pdf, pdfInfo, type PdfParameters, pdfParamsArray } from '$lib/client/pdf';
    import type { Snippet } from 'svelte';
    import { generatePdf } from '$lib/client/pdfGeneration';
    import type { LanguageCode } from '$lib/languages';

    import type { OpenPdfOptions } from '$lib/forms/FormInfo';
    import FileSaver from 'file-saver';
    import { endLoading, progress, startLoading, withLoading } from '$lib/helpers/title.svelte';

    type Props<P extends Pdf> = OpenPdfOptions<P> & {
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
        link,
        name,
        lang,
        t,
        enabled = true,
        hideLanguageSelector = false,
        children,
        dropdown,
        breakpoint = 'sm',
        data,
        ...parameters
    }: Props<P> = $props();

    const pdf = $derived(pdfInfo[link]);
    const defaultLanguage = $derived(pdf.supportedLanguages.includes(lang)
        ? lang
        : pdf.supportedLanguages[0]);

    const openPdf = withLoading(async (lang: LanguageCode = defaultLanguage) => {
        const p = parameters as unknown as PdfParameters<P>;
        const pdfData = await generatePdf(pdf, lang, data, ...pdfParamsArray(p))

        FileSaver.saveAs(new Blob([pdfData.pdfBytes], {
            type: 'application/pdf',
        }), pdfData.fileName);
    });
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
                    onclick={() => openPdf()}
                    class:disabled={!enabled}
                    class="btn btn-info text-nowrap"
                >{t.openPdf}</button>
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
                                        onclick={() => openPdf(code)}
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