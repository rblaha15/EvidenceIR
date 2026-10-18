<script lang="ts" module>
    import type { Readable } from 'svelte/store';

    export interface ArraysOptions<K extends string> {
        fileType: 'xlsx';
        fileName: string;
        instructions: string[];
        arrays: {
            [Key in K]: {
                store: Readable<string[]>;
                header: string;
                excelHeader: string;
            };
        };
        sendData: (data: Record<K, string[]>) => Promise<void>;
    }

</script>

<script generics="K extends string" lang="ts">
    import DangerAlert from '$lib/components/alerts/DangerAlert.svelte';
    import SpinnerAlert from '$lib/components/alerts/OfflineAlert.svelte';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
    import { range } from '$lib/extensions';
    import { cn } from '$lib/utils';
    import type { ChangeEventHandler } from 'svelte/elements';
    import readXlsxFile from 'read-excel-file';
    import writeXlsxFile from 'write-excel-file';
    import { derived } from 'svelte/store';
    import type { TableColor } from './AdminTable.svelte';
    import { Button } from '$lib/components/ui/button';

    const { options }: { options: ArraysOptions<K> } = $props();
    // svelte-ignore state_referenced_locally
    const { fileName, instructions, arrays, sendData } = options;

    const initialValue = arrays.mapValues(() => []);
    type Data = {
        [Key in K]: string[];
    };

    let input = $state() as HTMLInputElement;
    let file = $state<File>();
    let loading = $state(false);
    let error = $state(false);
    let newData = $state<Data>({ ...initialValue });

    $effect(() => {
        if (loading) error = false;
    });
    $effect(() => {
        if (!file) newData = { ...initialValue };
    });

    const findKey = (excelKey: string): K => arrays.entries().find(([_, { excelHeader }]) => excelHeader == excelKey)?.[0] as K;

    const onFileSelected: ChangeEventHandler<HTMLInputElement> = async ev => {
        file = ev.currentTarget.files?.[0];

        if (!file) return;

        const rows = await readXlsxFile(file);
        newData = rows.map(r => r.map(v => v ? String(v) : undefined))
            .transpose()
            .associate(row => [findKey(row[0]!), row.slice(1).filter(Boolean)] as const) as Data;
    };

    const downloadData = () => {
        const rows = oldData
            .mapTo((key, row) => [arrays[key].excelHeader, ...row])
            .map(row => row.map(col => ({ value: col })))
            .transpose(() => ({ value: '' }));
        writeXlsxFile(rows, {
            fileName: `${fileName}.xlsx`,
        });
    };

    const confirm = async () => {
        loading = true;

        try {
            await sendData(newData);
            file = undefined;
        } catch (e) {
            console.error(e);
            error = true;
        } finally {
            loading = false;
        }
    };

    const oldDataStore = derived(
        arrays.mapTo((_, array) => array.store),
        values => arrays.mapValues((_, __, i) => values[i]) as Data,
    );
    const oldData = $derived($oldDataStore);

    const selectFile = () => input.click();

    const oldTableData = $derived(oldData.mapValues((_, array) =>
        array.map(value => ({ value, color: undefined }))
    ));

    const changesTableData = $derived(newData.mapValues((key, newArray) => ({
        additions: newArray.filter(value => !oldData[key] || !oldData[key].includes(value)),
        removals: oldData[key]?.filter(value => !newArray || !newArray.includes(value)) ?? [],
    })).mapValues((_, { additions, removals }) => [
        ...additions.map(value => ({ value, color: 'success' as const })),
        ...removals.map(value => ({ value, color: 'danger' as const })),
    ]));

    const colorClasses: Record<TableColor, string> = {
        warning: '',
        danger: cn('bg-danger text-danger-foreground'),
        success: cn('bg-success text-success-foreground'),
        tertiary: '',
    };

    const cellClass = (color: TableColor | undefined) => color ? colorClasses[color] : '';
</script>

{#snippet table(tableData: Record<K, { value: string, color?: 'success' | 'danger' }[]>)}
    {@const length = tableData.getValues().maxOf(array => array.length)}

    <Table class="whitespace-nowrap">
        <TableHeader>
            <TableRow>
                {#each arrays.getValues() as array}
                    <TableHead>{array.header}</TableHead>
                {/each}
            </TableRow>
        </TableHeader>
        <TableBody>
            {#each range(length) as i}
                <TableRow>
                    {#each arrays.keys() as column}
                        {@const { value, color } = tableData[column][i] ?? { value: '' }}
                        <TableCell class={cellClass(color)}>
                            {value}
                        </TableCell>
                    {/each}
                </TableRow>
            {/each}
        </TableBody>
    </Table>
{/snippet}

{#each instructions as paragraph}
    <p>
        {@html paragraph}
    </p>
{/each}

{#if error}
    <DangerAlert title="Něco se nepovedlo" />
{/if}
{#if loading}
    <SpinnerAlert title="Odesílání dat" />
{/if}

<div class="flex flex-col items-start gap-4 md:flex-row md:items-center">
    {#if !loading && !file}
        <Button onclick={selectFile}>Vybrat soubor</Button>
    {:else if !loading}
        <Button variant="danger" onclick={confirm}>Potvrdit změny</Button>
        <Button variant="warning" onclick={() => (file = undefined)}>Zrušit změny</Button>
        <Button variant="warning" onclick={selectFile}>Vybrat jiný soubor</Button>
    {/if}
    <Button onclick={downloadData}>Stáhnout aktuální data</Button>
</div>

{#if file && !loading}
    <h4>Změny, které se chystáte provést:</h4>
    {#if !changesTableData.getValues().some(a => a.length)}
        <p>Žádné změny</p>
    {/if}
    {@render table(changesTableData)}
{/if}

<div>
    <h4>Aktuálně uložená data:</h4>
    {@render table(oldTableData)}
</div>

<input
    accept=".xls,.xlsx,.xlsm,.xlsb"
    bind:this={input}
    class="hidden"
    onchange={onFileSelected}
    type="file"
/>
