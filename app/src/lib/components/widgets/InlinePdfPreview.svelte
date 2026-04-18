<script generics="C, P extends Pdf" lang="ts">
    import type { Translations } from '$lib/translations';
    import { type Pdf, pdfInfo, type PdfParameters } from '$lib/pdf/pdf';
    import PdfPreview from '$lib/components/pdf/PdfPreview.svelte';
    import { generatePdfUrl } from '$lib/pdf/pdfGeneration';
    import { currentPreferredDocumentLanguage } from '$lib/languages';
    import type { InlinePdfPreviewWidget } from '$lib/forms/Widget';
    import { type Form, widgetList } from '$lib/forms/Form';
    import { Alert, AlertDescription, AlertTitle } from "$lib/components/ui/alert";
    import { OctagonAlert } from '@lucide/svelte';
    import { Spinner } from "$lib/components/ui/spinner";

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
        args, lang, data, pages,
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
    <Alert>
        <OctagonAlert />
        <AlertTitle>{t.pdf.previewNotAvailable}</AlertTitle>
        <AlertDescription>{t.pdf.wrongFields({ fields: errors.join(', ') })}</AlertDescription>
    </Alert>
{:else if error}
    <Alert variant="destructive">
        <OctagonAlert />
        <AlertTitle>{t.pdf.previewNotSuccessful}</AlertTitle>
    </Alert>
{:else if !url}
    <Alert>
        <Spinner />
        <AlertTitle>{t.pdf.previewLoading}</AlertTitle>
    </Alert>
{:else}
    <PdfPreview t={t.pdf} {url} />
{/if}