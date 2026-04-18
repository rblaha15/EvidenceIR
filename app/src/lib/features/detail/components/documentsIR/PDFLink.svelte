<script generics="P extends Pdf" lang="ts">
    import type { Translations } from '$lib/translations';
    import { type DataOfPdf, type OpenPdfOptions, type Pdf, type PdfID } from '$lib/pdf/pdf';
    import { currentPreferredDocumentLanguage } from '$lib/languages';
    import { generatePdfPreviewUrl } from '$lib/helpers/files';
    import type { LanguageCode } from '$lib/languageCodes';
    import type { DocumentLinkDefinition } from '$lib/features/detail/domain/documentsIR/createDocumentLinks.js';
    import SmallDropdown from '$lib/features/detail/components/documentsIR/SmallDropdown.svelte';
    import { FileInput } from '@lucide/svelte';
    import { ButtonGroup } from "$lib/components/ui/button-group";
    import { Button } from "$lib/components/ui/button";

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

<ButtonGroup class={["gap-x-4 gap-y-1", lang === 'de' ? 'flex-col items-start' : 'flex-wrap items-center']}>
    <ButtonGroup>
        <Button {disabled} href={generatePdfPreviewUrl(o).href} variant="outline">
            <FileInput />
            {#if name}<span>{name}</span>{/if}
        </Button>
        {#if dropdownItems && !disabled}
            <SmallDropdown {dropdownItems} />
        {/if}
    </ButtonGroup>
    {#if additionalButton && (additionalButton.show ?? disabled)}
        <ButtonGroup>
            <Button
                variant={additionalButton.important ? 'default' : 'outline'}
                href={additionalButton.href}
                onclick={additionalButton.onclick}
            >{additionalButton.text}</Button>
        </ButtonGroup>
    {/if}
</ButtonGroup>