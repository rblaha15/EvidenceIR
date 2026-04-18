<script lang="ts">
    import type { Translations } from '$lib/translations';
    import { type DisplayableHistoryEntry, readableHistory } from '$lib/client/history.svelte';
    import { CloudAlert, Database, History, Mail } from '@lucide/svelte';
    import { buttonVariants } from "$lib/components/ui/button";
    import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "$lib/components/ui/dialog";

    const { t }: { t: Translations } = $props();
    const th = $derived(t.nav.history)
</script>

{#snippet changes(list: DisplayableHistoryEntry[])}
    <ul class="list-group list-group-flush list-group">
        {#each list as entry}
            <li class="list-group-item flex flex-col gap-1 px-0">
                <span class="">{entry.datetime}</span>
                <div class="flex gap-4 items-center">
                    {#if entry.type === 'database'}
                        <Database size={48} />
                    {:else}
                        <Mail size={48} />
                    {/if}
                    <span class="grow">{entry.subject(t)}</span>
                </div>
            </li>
        {/each}
    </ul>
{/snippet}

<Dialog>
    {#if $readableHistory.incompleted.length}
        <DialogTrigger class={buttonVariants({ variant: 'warning', size: 'icon' })}>
            <CloudAlert class="size-8" />
            <span class="sr-only">{th.title}</span>
        </DialogTrigger>
    {:else if $readableHistory.completed.length}
        <DialogTrigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
            <History class="size-8" />
            <span class="sr-only">{th.title}</span>
        </DialogTrigger>
    {/if}
    <DialogContent class="max-h-[80vh] flex flex-col">
        <DialogHeader>
            <DialogTitle>{th.title}</DialogTitle>
            {#if $readableHistory.incompleted.length}
                <DialogDescription>{th.description}</DialogDescription>
            {/if}
        </DialogHeader>
        <div class="flex flex-col gap-4 overflow-y-auto">
            {#if $readableHistory.incompleted.length}
                <h3 class="text-lg">{th.incompletedChanges}</h3>
                {@render changes($readableHistory.incompleted)}
            {/if}
            <h3 class="text-lg">{th.changes}</h3>
            {@render changes($readableHistory.completed)}
        </div>
        <DialogFooter>
            <DialogClose class={buttonVariants({ variant: 'default' })}>{th.close}</DialogClose>
        </DialogFooter>
    </DialogContent>
</Dialog>