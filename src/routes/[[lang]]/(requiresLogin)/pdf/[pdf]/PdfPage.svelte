<script lang="ts">
    import { onMount } from 'svelte';

    const {
        pdf, pageNumber,
    }: {
        pdf: import('pdfjs-dist').PDFDocumentProxy, pageNumber: number,
    } = $props();

    let canvas = $state() as HTMLCanvasElement;
    const ctx = $derived(canvas?.getContext('2d'));

    const render = async (p: number) => {
        if (!pdf) return;

        if (!ctx) return;

        const page = await pdf.getPage(p);

        const viewport = page.getViewport({ scale: 3 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
            canvasContext: ctx,
            viewport: viewport,
        }).promise;
    };

    onMount(async () => {
        await render(pageNumber);
    });
</script>

<div class="d-flex flex-column">
    <canvas bind:this={canvas} style="max-width: 1024px"></canvas>
</div>
