<script generics="D, P extends Pdf" lang="ts">
    import type { Translations } from '$lib/translations';
    import { InlinePdfPreviewWidget } from '$lib/forms/Widget.svelte.js';
    import { type Pdf, pdfInfo, type PdfParameters } from '$lib/pdf/pdf';
    import PdfPreview from '$lib/components/pdf/PdfPreview.svelte';
    import { generatePdfUrl } from '$lib/pdf/pdfGeneration';
    import { currentPreferredDocumentLanguage } from '$lib/languages';

    interface Props<P extends Pdf> {
        t: Translations;
        widget: InlinePdfPreviewWidget<D, P>;
        data: D;
    }

    const { t, widget, data: formData }: Props<P> = $props();

    const { type, data, ...parameters } = $derived(widget.pdfData(t, formData));

    const args = $derived(pdfInfo[type]);

    const lang = $derived(
        $currentPreferredDocumentLanguage && args.supportedLanguages.includes($currentPreferredDocumentLanguage)
            ? $currentPreferredDocumentLanguage
            : args.supportedLanguages[0],
    );

    const url = $derived(generatePdfUrl({
        ...(parameters as unknown as PdfParameters<P>),
        args, lang, data,
    }));
</script>

{#await url}
    <p class="alert alert-secondary d-flex align-items-center gap-3">
        <span class="spinner-border text-danger"></span>
        {t.pdf.previewLoading}
    </p>
{:then { url }}
    <PdfPreview t={t.pdf} {url} />
{:catch _}
    <p class="alert alert-danger">{t.pdf.previewNotSuccessful}</p>
{/await}