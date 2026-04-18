<script lang="ts">
    import type { Translations } from '$lib/translations';
    import NavItems from './NavItems.svelte';
    import { page } from '$app/state';
    import TableOfContents from '$lib/components/TableOfContents.svelte';
    import { buttonVariants } from '$lib/components/ui/button';
    import { Menu, X } from "@lucide/svelte";
    import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTrigger } from "$lib/components/ui/sheet";
    import { cn } from "$lib/utils";
    import { Separator } from "$lib/components/ui/separator";
    import type { Snippet } from "svelte";

    const { t, header }: { t: Translations, header: Snippet } = $props();

    let showSheet = $state(false);
</script>

<Sheet bind:open={showSheet}>
    <SheetTrigger class={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'md:hidden')}>
        <Menu class="size-8" />
        <span class="sr-only">Menu</span>
    </SheetTrigger>
    <SheetContent showCloseButton={false} side="left">
        <SheetHeader class="flex flex-row items-center justify-between">
            {@render header()}
            <SheetClose class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
                <X />
                <span class="sr-only">Close</span>
            </SheetClose>
        </SheetHeader>
        <div class="flex flex-col gap-4 px-4">
            <ul class="flex flex-col gap-1">
                <NavItems onclick={() => showSheet = false} {t} />
            </ul>
            {#if page.route.id?.includes('[form=form]')}
                <Separator />
                {#key page.url.pathname + page.url.search}
                    <div class="md:hidden toc">
                        <TableOfContents onclick={() => showSheet = false} {t} />
                    </div>
                {/key}
            {/if}
        </div>
    </SheetContent>
</Sheet>