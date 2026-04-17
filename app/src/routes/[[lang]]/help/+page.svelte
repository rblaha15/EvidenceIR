<script lang="ts">
    import type { PageProps } from './$types';
    import PdfPreview from '$lib/components/pdf/PdfPreview.svelte';
    import { onMount } from "svelte";
    import { setTitle } from "$lib/helpers/globals";

    const {
        data,
    }: PageProps = $props();

    const t = $derived(data.translations);

    onMount(() => setTitle(t.nn.title, true));
</script>

<PdfPreview t={t.pdf} url={data.url} />