<script lang="ts" module>
    import type { Comparable } from '$lib/extensions';
    import type { Readable } from 'svelte/store';

    export type DataTypes = {
        text: string,
        options: string,
        number: number,
        boolean: boolean,
        textArray: string[],
        datetime: string | Date,
        price: number,
    };
    export type DataType = keyof DataTypes;
    export type ValueType = DataTypes[DataType] | null;

    export interface TableOptions<T extends Record<string, ValueType>, Key extends keyof T> {
        file?: {
            fileType: 'xlsx' | 'csv';
            fileName: string;
            construct: (items: (string | undefined)[]) => T;
            deconstruct: (value: T) => (string | undefined)[];
        };
        store: Readable<T[] | 'loading'>;
        key: Key;
        instructions: string[];
        columns: {
            [K in keyof T]: {
                header: string;
                cellType?: 'data' | 'header';
                type?: DataType;
                transformValue?: (value: T[K]) => string | boolean;
                options?: string[];
                optional?: boolean;
            };
        };
        nosort?: boolean;
        sendData: (data: T[]) => Promise<void>;
        editable?: {
            defaultValue: T,
        };
    }

    export type TableChangeType = 'new' | 'edited' | 'deleted';
</script>

<script generics="T extends Record<string, ValueType>, Key extends keyof T" lang="ts">
    import DangerAlert from '$lib/components/alerts/DangerAlert.svelte';
    import SpinnerAlert from '$lib/components/alerts/SpinnerAlert.svelte';
    import type { ChangeEventHandler } from 'svelte/elements';
    import { page } from '$app/state';
    import readXlsxFile from 'read-excel-file';
    import Table from './Table.svelte';
    import FileSaver from 'file-saver';
    import writeXlsxFile from 'write-excel-file';
    import { Spinner } from '$lib/components/ui/spinner';
    import { Button } from '$lib/components/ui/button';
    import { tick, untrack } from 'svelte';

    const { id, options }: { id: string; options: TableOptions<T, Key> } = $props();
    // svelte-ignore state_referenced_locally
    const { store, key, instructions, columns, sendData, file: fileOptions, nosort } = options;

    let input = $state() as HTMLInputElement;
    let file = $state<File>();
    let loading = $state(false);
    let error = $state(false);
    let newData = $state<T[]>([]);

    $effect(() => {
        if (loading) error = false;
    });

    const onFileSelected: ChangeEventHandler<HTMLInputElement> = async ev => {
        file = ev.currentTarget.files?.[0];

        if (!file) {
            newData = [];
            return;
        }

        if (fileOptions?.fileType == 'csv') {
            const reader = new FileReader();
            reader.onload = async ev => {
                const text = ev.target?.result as string | null;
                newData = (text ?? '')
                    .split('\n')
                    .map(row => row.trim().replace(/  +/g, ' '))
                    .filter(row => row != '')
                    .map(row => row.split(';').map(col => (col ? col : undefined)))
                    .map(fileOptions.construct);
            };
            reader.readAsText(file, 'UTF-8');
        } else if (fileOptions?.fileType == 'xlsx') {
            const rows = await readXlsxFile(file);
            newData = rows
                .slice(1)
                .map(r => r.map(String))
                .map(fileOptions.construct);
        }
    };

    const downloadData = () => {
        if (fileOptions?.fileType == 'csv') {
            const text = oldData
                .map(fileOptions.deconstruct)
                .map(row => row.map(col => col ?? ''))
                .map(row => row.join(';').trim())
                .join('\n');
            FileSaver.saveAs(new Blob([text], { type: 'text/csv' }), `${fileOptions.fileName}.csv`);
        } else if (fileOptions?.fileType == 'xlsx') {
            const rows = oldData
                .map(fileOptions.deconstruct)
                .map(row => row.map(col => col ?? ''))
                .map(row => row.map(col => ({ value: col })));
            const headers = columns.mapTo((_, c) => ({ value: c.header }));
            writeXlsxFile([headers, ...rows], {
                fileName: `${fileOptions.fileName}.xlsx`,
            });
        }
    };

    const confirm = async () => {
        loading = true;

        try {
            await sendData(newData);
            file = undefined;
            newData = [];
        } catch (e) {
            console.error(e);
            error = true;
        } finally {
            loading = false;
        }
    };

    const shallowEquals = (a: T, b: T) => [...a.keys(), ...b.keys()].every(key => JSON.stringify(a[key]) === JSON.stringify(b[key]));

    const oldData = $derived($store == 'loading' ? [] : nosort ? $store : $store.sortedBy(it => it[key] as Comparable));

    const find = (values: T[], findKey: T[Key]) => values.find(value => value[key] === findKey);
    const oldKeys = $derived(oldData.map(item => item[key]));
    const newKeys = $derived(newData.map(item => item[key]));
    const changes = $derived(newData.filter(value => oldKeys.includes(value[key]) && !shallowEquals(value, find(oldData, value[key]) ?? value)));
    const removals = $derived(oldData.filter(value => !newKeys.includes(value[key])));
    const additions = $derived(newData.filter(value => !oldKeys.includes(value[key])));

    $effect(() => {
        page.url;
        if (oldData) untrack(() => {
            if (page.url.hash.includes(`${id}-`)) document.getElementById(page.url.hash)?.scrollIntoView();
        });
    });

    const selectFile = () => input.click();

    const addChangeType = <T, >(array: T[], color: TableChangeType) => array.map(it => [it, color] as [T, TableChangeType]);
    const withColors = $derived([...addChangeType(additions, 'new'), ...addChangeType(changes, 'edited'), ...addChangeType(removals, 'deleted')]);

    const onDataChanged = async (rowKey: T[Key], item: T | null) => {
        if (file || !newData.length) {
            file = undefined;
            newData = oldData;
        }
        const i = newData.findIndex(i => i[key] === rowKey);
        if (i > -1 && !item) newData.splice(i, 1);
        if (i > -1 && item) newData.splice(i, 1, item);
        if (i == -1 && item) newData.push(item);
        await tick(); document.getElementById(`changes-${id}`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        if (!additions.length && !removals.length && !changes.length) {
            file = undefined;
            newData = [];
        }
    };
</script>

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
    {#if !loading && !newData.length && fileOptions}
        <Button onclick={selectFile}>Vybrat soubor</Button>
    {:else if !loading && newData.length}
        <Button variant="danger" onclick={confirm}>Potvrdit změny</Button>
        <Button variant="warning" onclick={() => { file = undefined; newData = [] }}>Zrušit změny</Button>
        {#if fileOptions}
            <Button variant="warning" onclick={selectFile}>Vybrat jiný soubor</Button>
        {/if}
    {/if}
    {#if fileOptions}
        <Button onclick={downloadData}>Stáhnout aktuální data</Button>
    {/if}
</div>

{#if newData.length && !loading}
    <h4 id="changes-{id}">Změny, které se chystáte provést:</h4>
    {#if !additions.length && !removals.length && !changes.length}
        <p>Žádné změny</p>
    {:else}
        <Table changedItems={withColors} {onDataChanged} {options} {id} />
    {/if}
{/if}

<div>
    <h4 id="current-{id}">Aktuálně uložená data:</h4>
    {#if $store == 'loading'}
        <Spinner />
    {:else}
        <Table {id} items={oldData} {onDataChanged} {options} />
    {/if}
</div>

{#if fileOptions}
    <input
        accept={fileOptions.fileType === 'csv' ? 'text/csv' : '.xls,.xlsx,.xlsm,.xlsb'}
        bind:this={input}
        class="hidden"
        onchange={onFileSelected}
        type="file"
    />
{/if}
