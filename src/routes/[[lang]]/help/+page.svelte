<script lang="ts">
    import type { PageProps } from './$types';
    import PdfPreview from '$lib/components/pdf/PdfPreview.svelte';

    const {
        data,
    }: PageProps = $props();

    const t = $derived(data.translations.pdf);
</script>

<PdfPreview {t} url={data.url} />