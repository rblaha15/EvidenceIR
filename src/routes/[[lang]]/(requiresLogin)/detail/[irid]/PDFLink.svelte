<script lang="ts">
    import { languageNames, type Translations } from '$lib/translations';
    import type { PageData } from './$types';
    import { type Pdf, pdfInfo, toPdfTypeName } from '$lib/client/pdf';
    import type { Snippet } from 'svelte';
    import { generatePdf, getPdfData } from '$lib/client/pdfGeneration';
    import type { LanguageCode } from '$lib/languages';

    interface Props {
        linkName: Pdf;
        name?: string;
        data: PageData;
        t: Translations;
        enabled?: boolean;
        hideLanguageSelector?: boolean;
        children?: Snippet;
        breakpoint?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | '';
    }

    let {
        linkName,
        name,
        data,
        t,
        enabled = true,
        hideLanguageSelector = false,
        children,
        breakpoint = 'sm',
    }: Props = $props();

    const pdfTypeName = $derived(toPdfTypeName(linkName));
    const pdf = $derived(pdfInfo[pdfTypeName]);
    const defaultLanguage = $derived(pdf.supportedLanguages.includes(data.languageCode)
        ? data.languageCode
        : pdf.supportedLanguages[0]);

    let anchor = $state() as HTMLAnchorElement;
    let loading = $state(false);
    let error = $state('');
    let currentLang = $state('');

    const openPdf = async (lang: LanguageCode = defaultLanguage) => {
        loading = true;
        if (!anchor.href || !anchor.download || currentLang != lang) {
            error = '';
            const getData = getPdfData(linkName);

            const { data: pdfData, error: pdfError } = await generatePdf(lang, data.irid_spid, pdf, getData);
            if (!pdfData) {
                loading = false;
                return error = pdfError;
            }

            anchor.href = URL.createObjectURL(new Blob([pdfData.pdfBytes], {
                type: 'application/pdf',
            }));
            anchor.download = pdfData.fileName;
        }

        anchor.click();
        loading = false;
    };
</script>

<div
    class="d-flex flex-column flex-{breakpoint}-row align-items-{breakpoint}-center gap-1 gap-{breakpoint}-3">
    {#if name}<span>{name}</span>{/if}
    <div class="d-flex align-items-center gap-3 flex-wrap flex-{breakpoint}-nowrap">
        {#if enabled}
            <a aria-hidden="true" target="_blank" class="d-none" href="/" bind:this={anchor}></a>
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
            </div>
            {#if loading}
                <div class="spinner-border text-danger"></div>
            {/if}
        {/if}
        {@render children?.()}
    </div>
</div>

{#if error}
    <div class="alert alert-danger">
        {error}
    </div>
{/if}