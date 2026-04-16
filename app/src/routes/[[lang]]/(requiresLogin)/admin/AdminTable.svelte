<script lang="ts" module>
    import type { Readable } from 'svelte/store';
    import type { Comparable } from '$lib/extensions';

    export interface TableOptions<T, K extends string = keyof T & string> {
        fileType: 'xlsx' | 'csv';
        fileName: string;
        store: Readable<T[]>;
        construct: (items: (string | undefined)[]) => T;
        deconstruct: (value: T) => (string | undefined)[];
        key: (value: T, index: number) => Comparable;
        instructions: string[];
        columns: {
            [Key in K]: ({
                header: string;
                cellType?: 'data' | 'header';
                transformValue?: Key extends keyof T ? (value: T[Key]) => string : undefined;
            } & (Key extends keyof T ? {
                getValue?: (value: T) => string;
            } : {
                getValue: (value: T) => string;
            }));
        };
    }
</script>

<script generics="T extends Record<string, unknown>" lang="ts">
    import { getToken } from '$lib/client/auth';
    import type { ChangeEventHandler } from 'svelte/elements';
    import { page } from '$app/state';
    import readXlsxFile from 'read-excel-file';
    import Table from './Table.svelte';
    import FileSaver from 'file-saver';
    import writeXlsxFile from 'write-excel-file';
    import type { Color } from '$lib/forms/Widget';

    const { id, options }: { id: string, options: TableOptions<T> } = $props();
    const { fileType, construct, deconstruct, store, fileName, key, instructions, columns } = options;

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
                    .map(row => row.split(';').map(col => col ? col : undefined))
                    .map(construct);
            };
            reader.readAsText(file, 'UTF-8');
        } else if (fileType == 'xlsx') {
            const rows = await readXlsxFile(file);
            newData = rows.slice(1).map(r => r.map(String)).map(construct);
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

        const token = await getToken();
        const response = await fetch(`/api/update-data?type=${id}&token=${token}`, {
            method: 'POST',
            body: JSON.stringify({
                array: newData,
            }),
        });

        loading = false;

        if (response.ok) file = undefined;
        else error = true;
    };

    const shallowEquals = (a: T, b: T) =>
        [...a.keys(), ...b.keys()].every(key => JSON.stringify(a[key]) === JSON.stringify(b[key]));

    const oldData = $derived($store.sortedBy((it, i) => key(it, i)));

    const find = (values: T[], findKey: Comparable) => values.find((value, i) => key(value, i) === findKey);
    const oldKeys = $derived(oldData.map(key));
    const newKeys = $derived(newData.map(key));
    const changes = $derived(newData.filter(
        (value, i) => oldKeys.includes(key(value, i)) &&
            !shallowEquals(value, find(oldData, key(value, i)) ?? value),
    ));
    const removals = $derived(oldData.filter((value, i) => !newKeys.includes(key(value, i))));
    const additions = $derived(newData.filter((value, i) => !oldKeys.includes(key(value, i))));


    $effect(() => {
        page.url;
        if (oldData) {
            (async () => {
                // const { Tab } = await import('bootstrap'); TODO
                // if (page.url.hash)
                //     new Tab(`${page.url.hash.split('-')[0]}-tab`).show();
                if (page.url.hash.includes(`${id}-`))
                    document.getElementById(page.url.hash)?.scrollIntoView();
            })();
        }
    });

    const selectFile = () => input.click();

    const addColor = <T>(array: T[], color: Color) => array.map(it => [it, color] as [T, Color]);
    const withColors = $derived([
        ...addColor(additions, 'success'),
        ...addColor(changes, 'warning'),
        ...addColor(removals, 'danger'),
    ]);
</script>

{#each instructions as paragraph}
    <p class="m-0">
        {@html paragraph}
    </p>
{/each}

<div class="flex flex-col md:flex-row items-start md:items-center gap-4">
    {#if error}
        <span class="text-danger">Něco se nepovedlo</span>
    {/if}
    {#if loading}
        <div class="flex items-center gap-4">
            <span>Odesílání dat</span>
            <div class="spinner-border text-danger"></div>
        </div>
    {:else if !file}
        <button class="btn btn-primary" onclick={selectFile}>
            Vybrat soubor
        </button>
    {:else}
        <button type="button" class="btn btn-danger" onclick={confirm}>
            Potvrdit změny
        </button>
        <button class="btn btn-warning" onclick={() => file = undefined}>
            Zrušit změny
        </button>
        <button class="btn btn-warning" onclick={selectFile}>
            Vybrat jiný soubor
        </button>
    {/if}
    <button class="btn btn-primary" onclick={downloadData}>
        Stáhnout aktuální data
    </button>
</div>

{#if file && !loading}
    <h4 class="m-0">Změny, které se chystáte provést:</h4>
    {#if !additions.length && !removals.length && !changes.length}
        <p class="m-0">Žádné změny</p>
    {/if}
    <Table itemsWithColors={withColors} {options} {id} />
{/if}

<div>
    <h4 class="m-0">Aktuálně uložená data:</h4>
    <Table {id} items={oldData} {options} />
</div>

<input
    accept={fileType === 'csv' ? 'text/csv' : '.xls,.xlsx,.xlsm,.xlsb'}
    bind:this={input}
    class="hidden"
    onchange={onFileSelected}
    type="file"
/>