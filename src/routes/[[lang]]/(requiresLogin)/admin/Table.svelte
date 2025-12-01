<script generics="T, K extends string = keyof T & string" lang="ts">
    import { page } from '$app/state';
    import type { TableOptions } from './AdminTable.svelte';

    interface Props<T, K extends string = keyof T & string> {
        items?: T[];
        itemsWithColors?: [T, string][];
        options: TableOptions<T, K>;
        id: string;
    }

    let { items, itemsWithColors, options, id }: Props<T, K> = $props();
    const { key, columns } = options;

    let colors = $state() as string[];

    $effect(() => {
        if (itemsWithColors) {
            items = itemsWithColors.map(([item]) => item);
            colors = itemsWithColors.map(([, color]) => color);
        } else if (items) {
            colors = items.map(() => '');
        } else {
            throw 'No items';
        }
    });

    const itemText = <Key extends K>(key: Key, column: typeof columns[Key], item: T) =>
        column.getValue?.(item) ?? (column.transformValue ?? (s => `${s}`))(item[key as keyof T & Key])
</script>

<div class="overflow-x-auto">
    <table class="table text-break table-striped table-hover text-nowrap">
        <thead>
        <tr>
            {#each columns.getValues() ?? [] as column}
                <th>{column.header}</th>
            {/each}
        </tr>
        </thead>
        <tbody>
        {#each (items ?? []) as item, i}
            <tr class="table-{colors?.[i]}" id="{id}-{key(item)}"
                style:scroll-margin-top={6 + (document.querySelector('nav')?.getBoundingClientRect()?.height ?? 0) + 'px'}
                class:table-info={page.url.hash.split("-")[1] === key(item)}
            >
                {#each columns.entries() ?? [] as [key, column]}
                    {#if column.cellType === 'header'}
                        <th>{@html itemText(key, column, item)}</th>
                    {:else}
                        <td>{@html itemText(key, column, item)}</td>
                    {/if}
                {/each}
            </tr>
        {/each}
        </tbody>
    </table>
</div>