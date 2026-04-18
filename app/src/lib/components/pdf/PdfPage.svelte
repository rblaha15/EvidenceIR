<script lang="ts">
    import type { RenderTask } from 'pdfjs-dist';

    const {
        pdf, pageNumber,
    }: {
        pdf: import('pdfjs-dist').PDFDocumentProxy, pageNumber: number,
    } = $props();

    let canvas = $state() as HTMLCanvasElement;
    let task = $state<RenderTask>();

    const render = async (p: number) => {
        if (!pdf) return;

        const page = await pdf.getPage(p);

        const viewport = page.getViewport({ scale: 3 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (task) task.cancel();
        task = page.render({
            canvas,
            viewport: viewport,
        });
        await task.promise;
    };

    $effect(() => {
        pdf;
        render(pageNumber);
    });
</script>

<div class="flex flex-col">
    <canvas bind:this={canvas} class="max-w-5xl border-2"></canvas>
</div>
