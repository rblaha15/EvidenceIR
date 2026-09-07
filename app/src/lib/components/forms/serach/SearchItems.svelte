<script generics="T" lang="ts">
    import SearchItemComponent from '$lib/components/forms/serach/SearchItem.svelte';
    import type { SearchItem } from '$lib/forms/Widget';
    import type { Translations } from '$lib/translations';
    import { cn } from '$lib/utils';
    import type { ClassValue, MouseEventHandler } from 'svelte/elements';

    const { items, getSearchItem, onItemClick, t, class: klass, itemClass, errorClass }: {
        items: T[] | 'loading',
        getSearchItem: (item: T) => SearchItem,
        onItemClick?: (item: T) => MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>,
        t: Translations,
        class?: ClassValue,
        itemClass?: ClassValue,
        errorClass?: ClassValue,
    } = $props();

    const itemClasses = $derived(cn(
        'py-2 min-h-5',
        itemClass,
    ));
</script>

<div class={cn(["w-full text-base md:text-sm", klass])}>
    {#if items == 'loading'}
        <SearchItemComponent
            searchItem={{ pieces: [{ text: t.widget.loading }] }}
            element="div"
            class={cn(itemClasses, errorClass)}
        />
    {:else if !items.length}
        <SearchItemComponent
            searchItem={{ pieces: [{ text: t.widget.notFound }] }}
            element="div"
            class={cn(itemClasses, errorClass)}
        />
    {:else}
        {#each items as item}
            {@const searchItem = getSearchItem(item)}
            <SearchItemComponent
                {searchItem}
                element={searchItem.href ? 'anchor' : 'button'}
                class={cn(itemClasses, "cursor-pointer")}
                aria-disabled={searchItem.disabled}
                onclick={onItemClick?.(item)}
                href={searchItem.href ?? '#'}
            />
        {/each}
    {/if}
</div>