<script lang="ts">
    import type { DropdownItems } from '$lib/features/detail/domain/documentsIR/createDocumentLinks';
    import { EllipsisVertical } from '@lucide/svelte';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "$lib/components/ui/dropdown-menu";
    import { buttonVariants } from "$lib/components/ui/button";
    import { goto } from "$app/navigation";

    const { dropdownItems }: {
        dropdownItems: DropdownItems
    } = $props();
</script>

<DropdownMenu>
    <DropdownMenuTrigger
        class={buttonVariants({ variant: 'outline', size: 'icon' })}
        aria-label="Další možnosti"
    >
        <EllipsisVertical />
    </DropdownMenuTrigger>
    <DropdownMenuContent>
        {#each dropdownItems ?? [] as item}
            {#if !item.hide}
                {#if 'href' in item}
                    <DropdownMenuItem variant={item.variant} onSelect={() => goto(item.href)}>
                        <item.icon />
                        {item.text}
                    </DropdownMenuItem>
                {:else if 'onSelect' in item}
                    <DropdownMenuItem variant={item.variant} onSelect={item.onSelect}>
                        <item.icon />
                        {item.text}
                    </DropdownMenuItem>
                {:else}
                    <DropdownMenuLabel>
                        {item.text}
                    </DropdownMenuLabel>
                {/if}
            {/if}
        {/each}
    </DropdownMenuContent>
</DropdownMenu>