<script lang="ts">
    import type { RenderTask } from 'pdfjs-dist';

    const {
        pdf, pageNumber,
    }: {
        pdf: import('pdfjs-dist').PDFDocumentProxy, pageNumber: number,
    } = $props();

    let canvas = $state() as HTMLCanvasElement;
    let task = $state<RenderTask>();
    const ctx = $derived(canvas?.getContext('2d'));

    const render = async (p: number) => {
        if (!pdf) return;
        if (!ctx) return;

        const page = await pdf.getPage(p);

        const viewport = page.getViewport({ scale: 3 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (task) task.cancel();
        task = page.render({
            canvasContext: ctx,
            viewport: viewport,
        });
        await task.promise;
    };

    $effect(() => {
        pdf;
        render(pageNumber);
    });
</script>

<div class="d-flex flex-column">
    <canvas bind:this={canvas} style="max-width: min(1024px, 100%)"></canvas>
</div>
