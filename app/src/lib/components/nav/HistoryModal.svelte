<script lang="ts">
    import type { Translations } from '$lib/translations';
    import { type DisplayableHistoryEntry, readableHistory } from '$lib/client/history.svelte';
    import { CloudAlert, Database, History, Mail } from '@lucide/svelte';
    import { buttonVariants } from "$lib/components/ui/button";
    import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "$lib/components/ui/dialog";
    import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "$lib/components/ui/item";

    const { t }: { t: Translations } = $props();
    const th = $derived(t.nav.history)
</script>

{#snippet changes(list: DisplayableHistoryEntry[])}
    <div class="flex flex-col">
        {#each list as entry}
            <Item>
                <ItemMedia variant="icon">
                    {#if entry.type === 'database'}
                        <Database />
                    {:else}
                        <Mail />
                    {/if}
                </ItemMedia>
                <ItemContent>
                    <ItemTitle>{entry.subject(t)}</ItemTitle>
                    <ItemDescription>{entry.datetime}</ItemDescription>
                </ItemContent>
            </Item>
        {/each}
    </div>
{/snippet}

<Dialog>
    {#if $readableHistory.incompleted.length}
        <DialogTrigger class={[buttonVariants({ variant: 'ghost', size: 'icon' }), 'text-danger']}>
            <CloudAlert class="size-8" />
            <span class="sr-only">{th.title}</span>
        </DialogTrigger>
    {:else if $readableHistory.completed.length}
        <DialogTrigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
            <History class="size-8" />
            <span class="sr-only">{th.title}</span>
        </DialogTrigger>
    {/if}
    <DialogContent class="max-h-[80vh] flex flex-col px-0">
        <DialogHeader class="px-6">
            <DialogTitle>{th.title}</DialogTitle>
            {#if $readableHistory.incompleted.length}
                <DialogDescription>{th.description}</DialogDescription>
            {/if}
        </DialogHeader>
        <div class="flex flex-col gap-4 overflow-y-auto px-6 [scrollbar-gutter:stable]">
            {#if $readableHistory.incompleted.length}
                <h3 class="text-lg">{th.incompletedChanges}</h3>
                {@render changes($readableHistory.incompleted)}
            {/if}
            <h3 class="text-lg">{th.changes}</h3>
            {@render changes($readableHistory.completed)}
        </div>
        <DialogFooter class="px-6">
            <DialogClose class={buttonVariants({ variant: 'primary' })}>{th.close}</DialogClose>
        </DialogFooter>
    </DialogContent>
</Dialog>