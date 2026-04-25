<script generics="C, P extends Pdf" lang="ts">
    import type { Translations } from '$lib/translations';
    import { type Pdf, pdfInfo, type PdfParameters } from '$lib/pdf/pdf';
    import PdfPreview from '$lib/components/pdf/PdfPreview.svelte';
    import { generatePdfUrl } from '$lib/pdf/pdfGeneration';
    import { currentPreferredDocumentLanguage } from '$lib/languages';
    import type { InlinePdfPreviewWidget } from '$lib/forms/Widget';
    import { type Form, widgetList } from '$lib/forms/Form';

    interface Props<P extends Pdf> {
        t: Translations;
        widget: InlinePdfPreviewWidget<C, P>;
        context: C;
    }

    const { t, widget, context }: Props<P> = $props();

    const { type, data, values, form, pages, ...parameters } = $derived(widget.pdfData(t, context));

    const args = $derived(pdfInfo[type]);

    const lang = $derived(
        $currentPreferredDocumentLanguage && args.supportedLanguages.includes($currentPreferredDocumentLanguage)
            ? $currentPreferredDocumentLanguage
            : args.supportedLanguages[0],
    );

    const list = $derived(widgetList<C, Form<C>>(form, values));
    const errors = $derived(list
        .filter(({ widget, value }) => widget.isError(context, value) && widget.show(context))
        .map(({ widget }) => widget.label(t, context)),
    );

    const result = $derived(errors.length ? null : generatePdfUrl({
        ...(parameters as unknown as PdfParameters<P>),
        lang, data, pages, link: type,
    }));

    let url = $state<string>();
    let error = $state(false);

    $effect(() => {
        result?.then(r => {
            url = r.url;
            error = false;
        }).catch(e => {
            console.error(e);
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