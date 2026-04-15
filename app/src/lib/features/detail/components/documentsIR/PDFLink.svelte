<script generics="P extends Pdf" lang="ts">
    import type { Translations } from '$lib/translations';
    import { type DataOfPdf, type OpenPdfOptions, type Pdf, type PdfID } from '$lib/pdf/pdf';
    import { currentPreferredDocumentLanguage } from '$lib/languages';
    import Icon from '$lib/components/Icon.svelte';
    import { generatePdfPreviewUrl } from '$lib/helpers/files';
    import type { LanguageCode } from '$lib/languageCodes';
    import type { DocumentLinkDefinition } from '$lib/features/detail/domain/documentsIR/createDocumentLinks.js';
    import SmallDropdown from '$lib/features/detail/components/documentsIR/SmallDropdown.svelte';

    type Props<P extends Pdf> = DocumentLinkDefinition<P> & PdfID<P> & {
        data: DataOfPdf<P>,
        t: Translations;
        lang: LanguageCode;
    }

    const {
        name,
        t,
        lang,
        disabled,
        dropdownItems,
        additionalButton,
        data,
        ...options
    }: Props<P> = $props();

    const o = $derived({
        ...options,
        lang: $currentPreferredDocumentLanguage,
    } as unknown as OpenPdfOptions<P>);
</script>

<div class={["flex column-gap-4 row-gap-1", lang === 'de' ? 'flex-column align-items-start' : 'flex-wrap align-items-center']}>
    {#if !disabled}
        <div class="flex flex-row gap-4 flex-shrink-0">
            <a
                href={generatePdfPreviewUrl(o).href}
                class="link-offset-1 btn btn-link text-nowrap"
                tabindex="0"
                style="--bs-btn-padding-x: 0rem"
            >
                <Icon icon="file_open" />
                {#if name}<span>{name}</span>{/if}
            </a>
            {#if dropdownItems}
                <SmallDropdown {dropdownItems} />
            {/if}
        </div>
    {:else if name}
        <span class="my-1 flex-shrink-0">{name}</span>
    {/if}

    {#if additionalButton}
        <div class="flex-shrink-0">
            {#if additionalButton.show ?? disabled}
                {#if additionalButton.dialogID}
                    <button
                        data-bs-toggle="modal"
                        data-bs-target="#{additionalButton.dialogID}"
                        class={['btn block', additionalButton.important ? 'btn-primary' : 'btn-outline-primary' ]}
                    >{additionalButton.text}</button>
                {:else}
                    <a
                        tabindex="0"
                        class={['btn block', additionalButton.important ? 'btn-primary' : 'btn-outline-primary' ]}
                        href={additionalButton.href}
                    >{additionalButton.text}</a>
                {/if}
            {/if}
        </div>
    {/if}
</div>