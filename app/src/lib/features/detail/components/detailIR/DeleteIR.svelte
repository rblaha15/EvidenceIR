<script lang="ts">
    import { removeIR } from '$lib/features/detail/actions/detailIR/ir';
    import type { Translations } from '$lib/translations';
    import type { IRID } from '$lib/helpers/ir';
    import { Trash2 } from '@lucide/svelte';
    import {
        AlertDialog,
        AlertDialogAction,
        AlertDialogCancel,
        AlertDialogContent,
        AlertDialogDescription,
        AlertDialogFooter,
        AlertDialogHeader,
        AlertDialogTitle,
        AlertDialogTrigger
    } from "$lib/components/ui/alert-dialog";
    import { buttonVariants } from "$lib/components/ui/button";
    import { Spinner } from "$lib/components/ui/spinner";

    const { td, irid }: {
        td: Translations['detail'],
        irid: IRID,
    } = $props()

    let processing = $state(false);
</script>

<AlertDialog>
    <AlertDialogTrigger class={buttonVariants({ variant: 'secondary' })}>
        <Trash2 />
        {td.deleteThisRecord}
    </AlertDialogTrigger>
    <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>
                <Trash2 />
                {td.delete}
            </AlertDialogTitle>
            <AlertDialogDescription>
                {td.confirmDeletion}
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel variant="default" disabled={processing}>
                {#if processing}
                    <Spinner />
                {/if}
                {td.cancel}
            </AlertDialogCancel>
            <AlertDialogAction onclick={async () => {
                processing = true;
                await removeIR(irid);
                processing = false;
            }} variant="destructive" disabled={processing}>
                {#if processing}
                    <Spinner />
                {/if}
                {td.delete}
            </AlertDialogAction>
        </AlertDialogFooter>
    </AlertDialogContent>
</AlertDialog>