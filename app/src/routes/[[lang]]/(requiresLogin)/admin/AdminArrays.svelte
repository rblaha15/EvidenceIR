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
    }

</script>

<script generics="K extends string" lang="ts">
    import { getToken } from '$lib/client/auth';
    import type { ChangeEventHandler } from 'svelte/elements';
    import { page } from '$app/state';
    import readXlsxFile from 'read-excel-file';
    import Table from './Table.svelte';
    import writeXlsxFile from 'write-excel-file';
    import { derived } from 'svelte/store';
    import type { TableOptions } from './AdminTable.svelte';
    import type { Color } from '$lib/forms/Widget';

    const { id, options }: { id: string, options: ArraysOptions<K> } = $props();
    const { fileName, instructions, arrays } = options;

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

        const token = await getToken();
        const response = await fetch(`/api/update-data?type=${id}&token=${token}`, {
            method: 'POST',
            body: JSON.stringify({
                arrays: newData,
            }),
        });

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
                    ? row.map(col => ({ key, value: col, color: 'success' as Color | undefined }))
                    : [{ key, value: '', color: undefined }],
            ),
    );
    const removalsTableData = $derived(
        removals
            .mapTo((key, row) =>
                row.length
                    ? row.map(col => ({ key, value: col, color: 'danger' as Color | undefined }))
                    : [{ key, value: '', color: undefined }],
            ),
    );
    const changesTableData = $derived(
        additionsTableData.zip(removalsTableData).map(pair => pair.flat())
            .transpose(row => ({ key: row[0].key, value: '', color: undefined }))
            .map(row => [
                Object.assign({}, ...row.map(col => ({ [col.key]: col.value }))),
                Object.assign({}, ...row.map(col => ({ [col.key]: col.color }))),
            ] as [Record<K, string>, Record<K, Color | undefined>]),
    );
</script>

{#each instructions as paragraph}
    <p class="m-0">
        {@html paragraph}
    </p>
{/each}

<div class="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">
    {#if error}
        <span class="text-danger">Něco se nepovedlo</span>
    {/if}
    {#if loading}
        <div class="d-flex align-items-center gap-3">
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
    {#if ![...additions.getValues(), ...removals.getValues()].some(a => a.length)}
        <p class="m-0">Žádné změny</p>
    {/if}
    <Table itemsWithItemColors={changesTableData} options={tableOptions} {id} />
{/if}

<div>
    <h4 class="m-0">Aktuálně uložená data:</h4>
    <Table {id} items={oldTableData} options={tableOptions} />
</div>

<input
    accept=".xls,.xlsx,.xlsm,.xlsb"
    bind:this={input}
    class="d-none"
    onchange={onFileSelected}
    type="file"
/>