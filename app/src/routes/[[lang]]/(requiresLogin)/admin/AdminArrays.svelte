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
            };
        };
        sendData: (data: Record<K, string[]>) => Promise<Response>;
    }

</script>

<script generics="K extends string" lang="ts">
    import type { ChangeEventHandler } from 'svelte/elements';
    import { page } from '$app/state';
    import readXlsxFile from 'read-excel-file';
    import Table from './Table.svelte';
    import writeXlsxFile from 'write-excel-file';
    import { derived } from 'svelte/store';
    import type { TableColor, TableOptions } from './AdminTable.svelte';
    import { untrack } from "svelte";
    import { Alert, AlertTitle } from "$lib/components/ui/alert";
    import { Spinner } from "$lib/components/ui/spinner";
    import { OctagonAlert } from '@lucide/svelte';
    import { Button } from "$lib/components/ui/button";

    const { id, options }: { id: string, options: ArraysOptions<K> } = $props();
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

    const onFileSelected: ChangeEventHandler<HTMLInputElement> = async ev => {
        file = ev.currentTarget.files?.[0];

        if (!file) return;

        const rows = await readXlsxFile(file);
        newData = rows.map(r => r.map(v => v ? String(v) : undefined))
            .transpose()
            .associate(row => [row[0] as K, row.slice(1).filter(Boolean)] as const) as Data;
    };

    const downloadData = () => {
        const rows = oldData
            .mapTo((key, row) => [key as string, ...row])
            .map(row => row.map(col => ({ value: col })))
            .transpose(() => ({ value: '' }));
        writeXlsxFile(rows, {
            fileName: `${fileName}.xlsx`,
        });
    };

    const confirm = async () => {
        loading = true;

        const response = await sendData(newData);

        loading = false;

        if (response.ok) file = undefined;
        else error = true;
    };

    const oldDataStore = derived(
        arrays.mapTo((_, array) => array.store),
        values => arrays.mapValues((_, __, i) => values[i]) as Data,
    );
    const oldData = $derived($oldDataStore);

    const removals = $derived(oldData.mapValues((key, oldArray) =>
        oldArray.filter(value => !newData[key].includes(value)),
    ));
    const additions = $derived(newData.mapValues((key, newArray) =>
        newArray.filter(value => !oldData[key].includes(value)),
    ));

    $effect(() => {
        page.url;
        if (oldData) untrack(() => {
            if (page.url.hash.includes(`${id}-`))
                document.getElementById(page.url.hash)?.scrollIntoView();
        });
    });

    const selectFile = () => input.click();

    const tableOptions: Pick<TableOptions<Record<K, string>>, 'key' | 'columns'> = $derived({
        key: (_, i) => i,
        columns: arrays.mapValues((key, array) => ({
            header: array.header,
            getValue: r => r[key],
        })),
    });
    const oldTableData = $derived(
        oldData
            .mapTo((key, row) =>
                row.length
                    ? row.map(col => ({ [key as string]: col }))
                    : [{ [key as string]: '' }],
            )
            .transpose(row => row[0].mapValues(() => ''))
            .map(row => Object.assign({}, ...row) as Record<K, string>),
    );
    const additionsTableData = $derived(
        additions
            .mapTo((key, row) =>
                row.length
                    ? row.map(col => ({ key, value: col, color: 'success' as TableColor | undefined }))
                    : [{ key, value: '', color: undefined }],
            ),
    );
    const removalsTableData = $derived(
        removals
            .mapTo((key, row) =>
                row.length
                    ? row.map(col => ({ key, value: col, color: 'danger' as TableColor | undefined }))
                    : [{ key, value: '', color: undefined }],
            ),
    );
    const changesTableData = $derived(
        additionsTableData.zip(removalsTableData).map(pair => pair.flat())
            .transpose(row => ({ key: row[0].key, value: '', color: undefined }))
            .map(row => [
                Object.assign({}, ...row.map(col => ({ [col.key]: col.value }))),
                Object.assign({}, ...row.map(col => ({ [col.key]: col.color }))),
            ] as [Record<K, string>, Record<K, TableColor | undefined>]),
    );
</script>

{#each instructions as paragraph}
    <p>
        {@html paragraph}
    </p>
{/each}

{#if error}
    <Alert variant="danger">
        <OctagonAlert />
        <AlertTitle>Něco se nepovedlo</AlertTitle>
    </Alert>
{/if}
{#if loading}
    <Alert>
        <Spinner />
        <AlertTitle>Odesílání dat</AlertTitle>
    </Alert>
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
    {#if ![...additions.getValues(), ...removals.getValues()].some(a => a.length)}
        <p>Žádné změny</p>
    {/if}
    <Table itemsWithItemColors={changesTableData} options={tableOptions} {id} />
{/if}

<div>
    <h4>Aktuálně uložená data:</h4>
    <Table {id} items={oldTableData} options={tableOptions} />
</div>

<input
    accept=".xls,.xlsx,.xlsm,.xlsb"
    bind:this={input}
    class="hidden"
    onchange={onFileSelected}
    type="file"
/>
