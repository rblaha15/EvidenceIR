<script lang="ts">
    import type { Translations } from '$lib/translations';
    import { confirmRefsite } from '$lib/features/detail/actions/documentsIR/refsite';
    import type { ExistingIR } from '$lib/data';
    import type { TC } from "$lib/forms/IN/defaultIN";
    import {
        AlertDialog,
        AlertDialogAction,
        AlertDialogContent,
        AlertDialogDescription,
        AlertDialogFooter,
        AlertDialogHeader,
        AlertDialogTitle
    } from "$lib/components/ui/alert-dialog";
    import { Spinner } from "$lib/components/ui/spinner";

    let {
        td, ir, openedRefsiteModal = $bindable(),
    }: {
        ir: ExistingIR,
        td: Translations['detail'],
        openedRefsiteModal: TC | undefined,
    } = $props();

    const tc = $derived(openedRefsiteModal!);
    let processing = $state(false);
</script>

<AlertDialog open={!!openedRefsiteModal} onOpenChange={opened => {
    if (!opened && !processing)
        openedRefsiteModal = undefined;
}}>
    <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>
                {td.refsiteTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
                {@html td.refsiteHtml}
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogAction onclick={async () => {
                processing = true;
                await confirmRefsite(ir, tc);
                processing = false;
                openedRefsiteModal = undefined;
            }} disabled={processing} variant="outline">
                {#if processing}
                    <Spinner />
                {/if}
                {td.no}
            </AlertDialogAction>
            <AlertDialogAction onclick={async () => {
                processing = true;
                await confirmRefsite(ir, tc, true);
                processing = false;
                openedRefsiteModal = undefined;
            }} disabled={processing}>
                {#if processing}
                    <Spinner />
                {/if}
                {td.yes}
            </AlertDialogAction>
        </AlertDialogFooter>
    </AlertDialogContent>
</AlertDialog>