<script generics="T, K extends string = keyof T & string" lang="ts">
    import { page } from '$app/state';
    import type { TableOptions } from './AdminTable.svelte';
    import type { Color } from '$lib/forms/Widget';

    type ItemColors = { [_ in K]: Color | undefined };
    interface Props<T, K extends string = keyof T & string> {
        items?: T[];
        itemsWithColors?: [T, Color | undefined][];
        itemsWithItemColors?: [T, ItemColors][];
        options: Pick<TableOptions<T, K>, 'key' | 'columns'>;
        id: string;
    }

    let { items, itemsWithColors, itemsWithItemColors, options, id }: Props<T, K> = $props();
    const { key, columns } = options;

    let colors = $state() as ItemColors[];

    $effect(() => {
        if (itemsWithItemColors) {
            items = itemsWithItemColors.map(([item]) => item);
            colors = itemsWithItemColors.map(([_, colors]) => colors);
        } else if (itemsWithColors) {
            items = itemsWithColors.map(([item]) => item);
            colors = itemsWithColors.map(([_, color]) => columns.mapValues(() => color));
        } else if (items) {
            colors = items.map(() => columns.mapValues(() => undefined));
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
            <tr id="{id}-{key(item, i)}"
                style:scroll-margin-top={6 + (document.querySelector('nav')?.getBoundingClientRect()?.height ?? 0) + 'px'}
                class:table-info={page.url.hash.split("-")[1] === key(item, i)}
            >
                {#each columns.entries() ?? [] as [key, column]}
                    {#if column.cellType === 'header'}
                        <th class="table-{colors?.[i]?.[key]}">{@html itemText(key, column, item)}</th>
                    {:else}
                        <td class="table-{colors?.[i]?.[key]}">{@html itemText(key, column, item)}</td>
                    {/if}
                {/each}
            </tr>
        {/each}
        </tbody>
    </table>
</div>