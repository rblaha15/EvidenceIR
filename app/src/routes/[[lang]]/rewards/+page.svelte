<script lang="ts">
    import type { PageProps } from './$types';
    import PdfPreview from '$lib/components/pdf/PdfPreview.svelte';
    import { downloadFile } from '$lib/helpers/files';
    import { FileDown } from "@lucide/svelte";
    import { onMount } from "svelte";
    import { setTitle } from "$lib/helpers/globals";

    const {
        data,
    }: PageProps = $props();

    const t = $derived(data.translations);

    const download = async () => downloadFile(data.url, data.fileName);

    onMount(() => setTitle(t.auth.rewards, true));
</script>

<PdfPreview t={t.pdf} url={data.url}>
    <button class="btn btn-primary" onclick={download}>
        <FileDown />
        {t.pdf.downloadFile}
    </button>
</PdfPreview>