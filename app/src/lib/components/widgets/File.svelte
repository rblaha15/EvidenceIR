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
    import { Button } from "$lib/components/ui/button";
    import { Card, CardContent } from "$lib/components/ui/card";
    import { Field, FieldError, FieldGroup, FieldTitle } from "$lib/components/ui/field";
    import { Item, ItemActions, ItemContent, ItemTitle } from "$lib/components/ui/item";

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

    const invalid = $derived(widget.isError(context, value) && showError);
</script>

<Card class="w-full" size="sm">
    <CardContent class="gap-1">
        <FieldGroup>
            <Field orientation="responsive" data-invalid={invalid}>
                <FieldTitle>{labelAndStar(widget, context, t)}</FieldTitle>
                {#if value.length === 0 || (multiple && value.length < max)}
                    <Button onclick={() => inputSelect?.click()}>
                        {multiple ? t.widget.selectFiles : t.widget.selectFile}
                    </Button>
                {/if}
            </Field>
        </FieldGroup>
        {#each value as {fileName, uuid}}
            <Item size="2xs" class="w-fit gap-4">
                <ItemContent>
                    <ItemTitle class="break-all">{fileName}</ItemTitle>
                </ItemContent>
                <ItemActions>
                    <Button variant="destructive" onclick={remove(uuid)}>
                        <FileX /> {t.widget.remove_File}
                    </Button>
                </ItemActions>
            </Item>
        {/each}
        {#if invalid}
            <FieldError>{widget.onError(t, context)}</FieldError>
        {/if}
    </CardContent>
</Card>

<input
    {accept}
    bind:this={inputSelect}
    class="hidden"
    {multiple}
    {onchange}
    type="file"
/>