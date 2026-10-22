<script generics="T extends Record<string, ValueType>, Key extends keyof T" lang="ts">
    import { page } from '$app/state';
    import { Button, buttonVariants } from '$lib/components/ui/button';
    import { ButtonGroup } from '$lib/components/ui/button-group';
    import { Checkbox } from '$lib/components/ui/checkbox';
    import {
        Dialog,
        DialogClose,
        DialogContent,
        DialogFooter,
        DialogHeader,
        DialogTitle,
    } from '$lib/components/ui/dialog';
    import { Field, FieldGroup, FieldLabel } from '$lib/components/ui/field';
    import { Input } from '$lib/components/ui/input';
    import { NativeSelect, NativeSelectOption } from '$lib/components/ui/native-select';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
    import type { DataType, ValueType } from '$lib/features/admin/AdminTable.svelte';
    import TopScrollable from '$lib/features/admin/TopScrollable.svelte';
    import { cn } from '$lib/utils';
    import { Pen, Plus, Trash } from '@lucide/svelte';
    import type { TableColor, TableOptions } from './AdminTable.svelte';

    type Column<K extends keyof T = keyof T> = TableOptions<T, Key>['columns'][K];

    interface Props<T extends Record<string, ValueType>, Key extends keyof T> {
        items?: T[];
        onDataChanged?: (key: T[Key], changed: T | null) => void;
        itemsWithColors?: [T, TableColor | undefined][];
        options: Pick<TableOptions<T, Key>, 'key' | 'columns' | 'editable'>;
        id: string;
        vetoEditable?: boolean;
    }

    let { items, itemsWithColors, options, id, onDataChanged, vetoEditable }: Props<T, Key> = $props();
    const { key, columns } = $derived(options);
    const editable = $derived(vetoEditable ? undefined : options.editable);

    const itemsWithKeys = $derived(
        (itemsWithColors ?? items!.map(item => [item, undefined]))
            .map(([item, color]) => ({ rowKey: item[key], item, color })),
    );

    type TableItem = typeof itemsWithKeys[number];

    const itemValue = <Key extends keyof T>(value: unknown, column: Column<Key>) => ({
        text: (value: string) => !value ? '' : value,
        options: (value: string) => !value ? '' : value,
        number: (value: number) => !value ? '' : value.toString(),
        boolean: (value: boolean) => !value ? false : value,
        textArray: (value: string[]) => (!value || !value.length) ? '' : value.join(', '),
        datetime: (value: string) => !value ? '' : new Date(value).toLocaleString('cs'),
        price: (value: number) => !value ? '' : value.roundTo(2).toLocaleString('cs') + ' Kč',
    } satisfies Record<DataType, (value: never) => unknown>)[column.type ?? 'text'](value as never);

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

    let editDialog = $state<{ rowKey: T[Key], data: T }>();
    let newDialog = $state<{ data: T }>();
</script>

{#snippet itemContent(columnKey: keyof T, column: Column, item: T)}
    {@const value = itemValue(item[columnKey], column)}
    {#if column.type == 'boolean'}
        <Checkbox checked={item[columnKey] as boolean} disabled aria-disabled />
    {:else}
        {value}
    {/if}
{/snippet}

{#snippet tableRow({ rowKey, item, color }: TableItem)}
    <TableRow id="{id}-{rowKey}"
              class={rowClass(page.url.hash.split("-")[1] === rowKey ? 'tertiary' : '')}>
        {#if editable}
            <TableCell class="py-0">
                <ButtonGroup>
                    <Button variant="tertiary" onclick={() => editDialog = { rowKey, data: item }}>
                        <Pen />
                    </Button>
                    <Button variant="danger" onclick={() => onDataChanged?.(rowKey, null)}>
                        <Trash />
                    </Button>
                </ButtonGroup>
            </TableCell>
        {/if}
        {#each columns.entries() as [columnKey, column]}
            {#if column.cellType === 'header'}
                <TableHead class={cellClass(color)}>
                    {@render itemContent(columnKey, column, item)}
                </TableHead>
            {:else}
                <TableCell class={cellClass(color)}>
                    {@render itemContent(columnKey, column, item)}
                </TableCell>
            {/if}
        {/each}
    </TableRow>
{/snippet}

{#if editable}
    <div class="py-3">
        <Button variant="tertiary" onclick={() => newDialog = { data: editable.defaultValue }}>
            <Plus />
            Nový záznam
        </Button>
    </div>
{/if}

<TopScrollable>
    <Table class="whitespace-nowrap" noscroll>
        <TableHeader>
            <TableRow>
                {#if editable}
                    <TableHead></TableHead>
                {/if}
                {#each columns.getValues() ?? [] as column}
                    <TableHead>{column.header}</TableHead>
                {/each}
            </TableRow>
        </TableHeader>
        <TableBody>
            {#each itemsWithKeys as row}
                {@render tableRow(row)}
            {/each}
        </TableBody>
    </Table>
</TopScrollable>

{#snippet dialog(edit: boolean, onConfirm: () => void)}
    {@const dialog = edit ? editDialog : newDialog}
    <Dialog onOpenChange={() => { editDialog = undefined; newDialog = undefined }} open={!!dialog}>
        <DialogContent class="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>
                    Upravit záznam
                </DialogTitle>
            </DialogHeader>
            <FieldGroup>
                {#each columns.entries() as [columnKey, column]}
                    {#if dialog && (!edit || columnKey != key)}
                        {@const rawValue = dialog.data[columnKey]}
                        {@const set = (value: unknown) => {
                            dialog.data[columnKey] = value as T[keyof T]
                        }}
                        {@const id = `${edit}-${String(columnKey)}`}
                        {@const opt = (v: unknown) => !v && column.optional ? undefined : v}
                        <Field orientation="responsive">
                            {#if column.type != 'boolean'}
                                <FieldLabel for={id}>{column.header}</FieldLabel>
                            {/if}
                            {#if column.type == 'boolean'}
                                <Checkbox {id} class="size-4!" checked={rawValue as boolean}
                                          onCheckedChange={() => set(!rawValue)} />
                                <FieldLabel for={id}>{column.header}</FieldLabel>
                            {:else if column.type == 'datetime'}
                                <Input {id} type="datetime-local"
                                       value={new Date(rawValue as string | Date).toISOString()}
                                       oninput={e => set(new Date(e.currentTarget.value).toISOString())} />
                            {:else if column.type == 'price'}
                                <Input {id} inputmode="decimal" value={(rawValue as number).toString()}
                                       oninput={e => set(opt(e.currentTarget.value.toNumber()))} />
                            {:else if column.type == 'number'}
                                <Input {id} inputmode="numeric" value={(rawValue as number).toString()}
                                       oninput={e => set(opt(e.currentTarget.value.toNumber()))} />
                            {:else if column.type == 'textArray'}
                                <Input {id} value={(rawValue as string[]).join(', ')}
                                       oninput={e => set(opt(e.currentTarget.value.split(', ')))} />
                            {:else if column.type == 'options'}
                                <NativeSelect {id} value={rawValue as string}
                                              onchange={e => set(opt(e.currentTarget.value))}>
                                    {#each column.options ?? [] as option}
                                        <NativeSelectOption value={option}>{option}</NativeSelectOption>
                                    {/each}
                                </NativeSelect>
                            {:else}
                                <Input {id} value={rawValue as string}
                                       oninput={e => set(opt(e.currentTarget.value))} />
                            {/if}
                        </Field>
                    {/if}
                {/each}
            </FieldGroup>
            <DialogFooter>
                <DialogClose class={buttonVariants({ variant: 'secondary' })}>
                    Zrušit
                </DialogClose>

                <DialogClose class={buttonVariants({ variant: 'tertiary' })} onclick={() => onConfirm()}>
                    Potvrdit
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
{/snippet}

{@render dialog(true, () => onDataChanged?.(editDialog!.rowKey, editDialog!.data))}
{@render dialog(false, () => onDataChanged?.(newDialog!.data[key], newDialog!.data))}