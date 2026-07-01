<script lang="ts" module>
    import type { Readable } from 'svelte/store';
    import type { Comparable } from '$lib/extensions';

    export interface TableOptions<T, K extends string = keyof T & string> {
        fileType: 'xlsx' | 'csv';
        fileName: string;
        store: Readable<T[] | 'loading'>;
        construct: (items: (string | undefined)[]) => T;
        deconstruct: (value: T) => (string | undefined)[];
        key: (value: T, index: number) => Comparable;
        instructions: string[];
        columns: {
            [Key in K]: {
            header: string;
            cellType?: 'data' | 'header';
            transformValue?: Key extends keyof T ? (value: T[Key]) => string : undefined;
        } & (Key extends keyof T
            ? {
                getValue?: (value: T) => string;
            }
            : {
                getValue: (value: T) => string;
            });
        };
        sendData: (data: T[]) => Promise<void>;
    }

    export type TableColor = 'warning' | 'success' | 'danger' | 'tertiary';
</script>

<script generics="T extends Record<string, unknown>" lang="ts">
    import type { ChangeEventHandler } from 'svelte/elements';
    import { page } from '$app/state';
    import readXlsxFile from 'read-excel-file';
    import Table from './Table.svelte';
    import FileSaver from 'file-saver';
    import writeXlsxFile from 'write-excel-file';
    import { Alert, AlertTitle } from '$lib/components/ui/alert';
    import { OctagonAlert } from '@lucide/svelte';
    import { Spinner } from '$lib/components/ui/spinner';
    import { Button } from '$lib/components/ui/button';
    import { untrack } from 'svelte';

    const { id, options }: { id: string; options: TableOptions<T> } = $props();
    const { fileType, construct, deconstruct, store, fileName, key, instructions, columns, sendData } = options;

    let input = $state() as HTMLInputElement;
    let file = $state<File>();
    let loading = $state(false);
    let error = $state(false);
    let newData = $state<T[]>([]);

    $effect(() => {
        if (loading) error = false;
    });
    $effect(() => {
        if (!file) newData = [];
    });

    const onFileSelected: ChangeEventHandler<HTMLInputElement> = async ev => {
        file = ev.currentTarget.files?.[0];

        if (!file) return;

        if (fileType == 'csv') {
            const reader = new FileReader();
            reader.onload = async ev => {
                const text = ev.target?.result as string | null;
                newData = (text ?? '')
                    .split('\n')
                    .map(row => row.trim().replace(/  +/g, ' '))
                    .filter(row => row != '')
                    .map(row => row.split(';').map(col => (col ? col : undefined)))
                    .map(construct);
            };
            reader.readAsText(file, 'UTF-8');
        } else if (fileType == 'xlsx') {
            const rows = await readXlsxFile(file);
            newData = rows
                .slice(1)
                .map(r => r.map(String))
                .map(construct);
        }
    };

    const downloadData = () => {
        if (fileType == 'csv') {
            const text = oldData
                .map(deconstruct)
                .map(row => row.map(col => col ?? ''))
                .map(row => row.join(';').trim())
                .join('\n');
            FileSaver.saveAs(new Blob([text], { type: 'text/csv' }), `${fileName}.csv`);
        } else {
            const rows = oldData
                .map(deconstruct)
                .map(row => row.map(col => col ?? ''))
                .map(row => row.map(col => ({ value: col })));
            const headers = columns.mapTo((_, c) => ({ value: c.header }));
            writeXlsxFile([headers, ...rows], {
                fileName: `${fileName}.xlsx`,
            });
        }
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

    const shallowEquals = (a: T, b: T) => [...a.keys(), ...b.keys()].every(key => JSON.stringify(a[key]) === JSON.stringify(b[key]));

    const oldData = $derived($store == 'loading' ? [] : $store.sortedBy((it, i) => key(it, i)));

    const find = (values: T[], findKey: Comparable) => values.find((value, i) => key(value, i) === findKey);
    const oldKeys = $derived(oldData.map(key));
    const newKeys = $derived(newData.map(key));
    const changes = $derived(newData.filter((value, i) => oldKeys.includes(key(value, i)) && !shallowEquals(value, find(oldData, key(value, i)) ?? value)));
    const removals = $derived(oldData.filter((value, i) => !newKeys.includes(key(value, i))));
    const additions = $derived(newData.filter((value, i) => !oldKeys.includes(key(value, i))));

    $effect(() => {
        page.url;
        if (oldData) untrack(() => {
            if (page.url.hash.includes(`${id}-`)) document.getElementById(page.url.hash)?.scrollIntoView();
        });
    });

    const selectFile = () => input.click();

    const addColor = <T, >(array: T[], color: TableColor) => array.map(it => [it, color] as [T, TableColor]);
    const withColors = $derived([...addColor(additions, 'success'), ...addColor(changes, 'warning'), ...addColor(removals, 'danger')]);
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
    {#if !additions.length && !removals.length && !changes.length}
        <p>Žádné změny</p>
    {/if}
    <Table itemsWithColors={withColors} {options} {id} />
{/if}

<div>
    <h4>Aktuálně uložená data:</h4>
    <Table {id} items={oldData} {options} />
</div>

<input
    accept={fileType === 'csv' ? 'text/csv' : '.xls,.xlsx,.xlsm,.xlsb'}
    bind:this={input}
    class="hidden"
    onchange={onFileSelected}
    type="file"
/>
