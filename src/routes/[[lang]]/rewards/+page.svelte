<script lang="ts">
    import type { PageProps } from './$types';
    import PdfPreview from '$lib/components/pdf/PdfPreview.svelte';
    import Icon from '$lib/components/Icon.svelte';
    import { downloadFile } from '$lib/helpers/files';

    const {
        data,
    }: PageProps = $props();

    const t = $derived(data.translations.pdf);

    const download = async () => downloadFile(data.url, data.fileName);
</script>

<PdfPreview {t} url={data.url}>
    <button class="btn btn-primary" onclick={download}>
        <Icon icon="file_download" />
        {t.downloadFile}
    </button>
</PdfPreview>