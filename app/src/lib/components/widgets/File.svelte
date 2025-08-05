<script lang="ts" module>
    import { v4 as uuid } from 'uuid';
    import { openDB } from 'idb';
    import { browser } from '$app/environment';

    const db = browser ? openDB<{
        files: {
            key: string;
            value: string;
        };
    }>('file-selector', 1, {
        upgrade: db => {
            if (!db.objectStoreNames.contains('files'))
                db.createObjectStore('files');
        },
    }) : undefined;

    export const addFile = (file: string) =>
        uuid().also(async id => await (await db!).add('files', file, id));
    export const removeFile = async (id: string) =>
        await (await db!).delete('files', id);
    export const removeAllFiles = async () =>
        await (await db!).clear('files');
    export const getFile = async (id: string) =>
        await (await db!).get('files', id);
</script>

<script generics="D" lang="ts">
    import type { Translations } from '$lib/translations';
    import { labelAndStar, type FileWidget, type Files } from '$lib/forms/Widget.svelte.js';
    import type { ChangeEventHandler } from 'svelte/elements';

    interface Props {
        t: Translations;
        widget: FileWidget<D>;
        data: D;
    }

    let { t, widget = $bindable(), data }: Props = $props();

    let inputSelect = $state<HTMLInputElement>();
    const accept = $derived(widget.accept(data, t));
    const multiple = $derived(widget.multiple(data));
    const max = $derived(widget.max(data));

    const onchange: ChangeEventHandler<HTMLInputElement> = async e => {
        const selectedFiles = e.currentTarget.files;
        if (selectedFiles) {
            const files = await [...selectedFiles].map(file => new Promise<Files[number]>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    if (typeof reader.result != 'string') reject();
                    else addFile(reader.result).then(uuid =>
                        resolve({ fileName: file.name, uuid }),
                    );
                };
                reader.readAsDataURL(file);
            })).awaitAll();

            widget.mutateValue(data, v => [...v, ...files].slice(0, max));
            if (e.currentTarget) e.currentTarget.value = '';
        }
    };

    const remove = (fileId: string) => async () => {
        await removeFile(fileId);
        widget.mutateValue(data, v => v.toSpliced(v.findIndex(f => f.uuid === fileId), 1));
    };
</script>

<div class="d-flex gap-1 flex-column">
    <div>{labelAndStar(widget, data, t)}</div>
    <div class="d-flex gap-3 flex-column align-items-start">
        {#if widget.value.length === 0 || (multiple && widget.value.length < max)}
            <button
                type="button"
                class="btn btn-outline-primary"
                onclick={() => inputSelect?.click()}
            >
                {multiple ? t.widget.selectFiles : t.widget.selectFile}
            </button>
        {/if}

        {#if widget.value.length}
            <ul class="list-group">
                {#each widget.value as { fileName, uuid }}
                    <li class="d-flex w-100 align-items-center list-group-item gap-3">
                        <div class="flex-grow-1 flex-shrink-1" style="word-break: break-all">{fileName}</div>
                        <button class="btn text-danger" onclick={remove(uuid)}><i class="my-1 bi-trash"></i> {t.widget.remove_File}</button>
                    </li>
                {/each}
            </ul>
        {/if}
    </div>

    {#if widget.showError(data)}
        <p class="text-danger">{t.get(widget.onError(data, t))}</p>
    {/if}

    <input
        {accept}
        bind:this={inputSelect}
        class="d-none"
        {multiple}
        {onchange}
        type="file"
    />
</div>