<script generics="T, K extends string = keyof T & string" lang="ts">
    import { page } from '$app/state';
    import type { TableColor, TableOptions } from './AdminTable.svelte';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
    import { cn } from "$lib/utils";

    type ItemColors = { [_ in K]: TableColor | undefined };
    interface Props<T, K extends string = keyof T & string> {
        items?: T[];
        itemsWithColors?: [T, TableColor | undefined][];
        itemsWithItemColors?: [T, ItemColors][];
        options: Pick<TableOptions<T, K>, 'key' | 'columns'>;
        id: string;
    }

    let { items, itemsWithColors, itemsWithItemColors, options, id }: Props<T, K> = $props();
    const { key, columns } = $derived(options);

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

    const itemText = <Key extends K>(key: Key, column: (typeof columns)[Key], item: T) =>
        column.getValue?.(item) ?? (column.transformValue ?? (s => `${s}`))(item[key as keyof T & Key]);

    const colorClasses: Record<TableColor, string> = {
        warning: cn('bg-warning text-warning-foreground'),
        danger: cn('bg-danger text-danger-foreground'),
        success: cn('bg-success text-success-foreground'),
        tertiary: cn('bg-tertiary text-tertiary-foreground'),
    };
    const colorRowClasses: Record<TableColor, string> = {
        warning: cn('[&>th,&>td]:bg-warning [&>th,&>td]:text-warning-foreground'),
        danger: cn('[&>th,&>td]:bg-danger [&>th,&>td]:text-danger-foreground'),
        success: cn('[&>th,&>td]:bg-success [&>th,&>td]:text-success-foreground'),
        tertiary: cn('[&>th,&>td]:bg-tertiary [&>th,&>td]:text-tertiary-foreground'),
    };

    const cellClass = (color?: string) => cn(
        color && (color in colorClasses) ? colorClasses[color as TableColor] : '',
        '[&>a]:text-primary [&>a]:underline-offset-4 [&>a]:hover:underline',
    );
    const rowClass = (color?: string) => color && (color in colorRowClasses) ? colorRowClasses[color as TableColor] : '';
</script>

<Table class="whitespace-nowrap">
    <TableHeader>
        <TableRow>
            {#each columns.getValues() ?? [] as column}
                <TableHead>{column.header}</TableHead>
            {/each}
        </TableRow>
    </TableHeader>
    <TableBody>
        {#each items ?? [] as item, i}
            <TableRow id="{id}-{key(item, i)}" class={rowClass(page.url.hash.split("-")[1] === key(item, i) ? 'tertiary' : '')}>
                {#each columns.entries() ?? [] as [key, column]}
                    {#if column.cellType === 'header'}
                        <TableHead class={cellClass(colors?.[i]?.[key])}>{@html itemText(key, column, item)}</TableHead>
                    {:else}
                        <TableCell class={cellClass(colors?.[i]?.[key])}>{@html itemText(key, column, item)}</TableCell>
                    {/if}
                {/each}
            </TableRow>
        {/each}
    </TableBody>
</Table>
