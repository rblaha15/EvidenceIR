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

    const { type, data, form, ...parameters } = $derived(widget.pdfData(t, formData));

    const args = $derived(pdfInfo[type]);

    const lang = $derived(
        $currentPreferredDocumentLanguage && args.supportedLanguages.includes($currentPreferredDocumentLanguage)
            ? $currentPreferredDocumentLanguage
            : args.supportedLanguages[0],
    );

    const result = $derived(generatePdfUrl({
        ...(parameters as unknown as PdfParameters<P>),
        args, lang, data,
    }));

    const list = $derived(form.getValues().flatMap(obj => obj.getValues()));
    const errors = $derived(list.filter(w => w.isError(formData) && w.show(formData)).map(w => w.label(t, formData)));

    let url = $state<string>();
    let error = $state(false);

    $effect(() => {
        result.then(r => {
            url = r.url;
            error = false;
        }).catch(_ => {
            url = undefined;
            error = true;
        });
    });
</script>

{#if errors.length}
    <p class="alert alert-warning m-0">{t.pdf.previewNotAvailable({ fields: errors.join(', ') })}</p>
{:else if error}
    <p class="alert alert-danger m-0">{t.pdf.previewNotSuccessful}</p>
{:else if !url}
    <p class="alert alert-secondary m-0 d-flex align-items-center gap-3">
        <span class="spinner-border text-danger"></span>
        {t.pdf.previewLoading}
    </p>
{:else}
    <PdfPreview t={t.pdf} {url} />
{/if}