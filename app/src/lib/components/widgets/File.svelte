<script lang="ts" module>
    import { v4 as uuid } from 'uuid';
    import { openDB } from 'idb';
    import { browser } from '$app/environment';

    const db = browser ? openDB<{
        files: {
            key: string;
            value: File;
        };
    }>('file-selector', 1, {
        upgrade: db => {
            if (!db.objectStoreNames.contains('files'))
                db.createObjectStore('files');
        },
    }) : undefined;

    export const addFile = (file: File) =>
        uuid().also(async id => await (await db!).add('files', file, id));
    export const removeFile = async (id: string) =>
        await (await db!).delete('files', id);
    export const removeAllFiles = async () =>
        await (await db!).clear('files');
    export const getFile = async (id: string) =>
        await (await db!).get('files', id);
</script>

<script generics="C" lang="ts">
    import type { Translations } from '$lib/translations';
    import type { ChangeEventHandler } from 'svelte/elements';
    import { type Files, type FileWidget, labelAndStar } from '$lib/forms/Widget';
    import { FileX } from '@lucide/svelte';

    interface Props {
        t: Translations;
        widget: FileWidget<C>;
        context: C;
        value: Files;
        showAllErrors: boolean;
    }

    let { t, widget, value = $bindable(), context, showAllErrors }: Props = $props();
    let showError = $derived(showAllErrors);

    let inputSelect = $state<HTMLInputElement>();
    const accept = $derived(widget.accept(context));
    const multiple = $derived(widget.multiple(context));
    const max = $derived(widget.max(context));

    const onchange: ChangeEventHandler<HTMLInputElement> = async e => {
        const selectedFiles = e.currentTarget.files;
        if (selectedFiles) {
            const files = await [...selectedFiles].map(file =>
                addFile(file).then(uuid => ({ fileName: file.name, uuid }))
            ).awaitAll();

            const newValue = [...value, ...files].slice(0, max)
            value = newValue;
            widget.onValueSet(context, newValue);
            if (e.currentTarget) e.currentTarget.value = '';
        }
        showError = true;
    };

    const remove = (fileId: string) => async () => {
        await removeFile(fileId);
        const newValue = value.toSpliced(value.findIndex(f => f.uuid === fileId), 1)
        value = newValue;
        widget.onValueSet(context, newValue);
        showError = true;
    };
</script>

<div class="flex gap-1 flex-col">
    <div>{labelAndStar(widget, context, t)}</div>
    <div class="flex gap-4 flex-col items-start">
        {#if value.length === 0 || (multiple && value.length < max)}
            <button
                type="button"
                class="btn btn-outline-primary"
                onclick={() => inputSelect?.click()}
            >
                {multiple ? t.widget.selectFiles : t.widget.selectFile}
            </button>
        {/if}

        {#if value.length}
            <ul class="list-group">
                {#each value as { fileName, uuid }}
                    <li class="flex w-full items-center list-group-item gap-4">
                        <div class="grow shrink" style="word-break: break-all">{fileName}</div>
                        <button class="btn text-danger" onclick={remove(uuid)}>
                            <FileX />
                            {t.widget.remove_File}
                        </button>
                    </li>
                {/each}
            </ul>
        {/if}
    </div>

    {#if widget.isError(context, value) && showError}
        <span class="text-danger">{widget.onError(t, context)}</span>
    {/if}

    <input
        {accept}
        bind:this={inputSelect}
        class="hidden"
        {multiple}
        {onchange}
        type="file"
    />
</div>