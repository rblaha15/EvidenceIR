<script generics="C" lang="ts">
    import type { Translations } from '$lib/translations';
    import type { ChangeEventHandler } from 'svelte/elements';
    import { addFile, getFile, removeFile } from '$lib/components/widgets/File.svelte';
    import { Button } from '$lib/components/ui/button';
    import { type Files, labelAndStar, type PhotoSelectorWidget } from '$lib/forms/Widget';
    import { ImageMinus } from "@lucide/svelte";
    import { Field, FieldError, FieldGroup, FieldTitle } from "$lib/components/ui/field";
    import { Card, CardContent } from "$lib/components/ui/card";
    import { Item, ItemActions, ItemContent, ItemHeader, ItemTitle } from "$lib/components/ui/item";

    interface Props {
        t: Translations;
        widget: PhotoSelectorWidget<C>;
        context: C;
        value: Files;
        showAllErrors: boolean;
    }

    let { t, widget, value = $bindable(), context, showAllErrors }: Props = $props();
    let showError = $derived(showAllErrors);

    let inputSelect = $state<HTMLInputElement>();
    let inputCapture = $state<HTMLInputElement>();
    const accept = $derived(widget.accept(context));
    const multiple = $derived(widget.multiple(context));
    const max = $derived(widget.max(context));

    const onchange: ChangeEventHandler<HTMLInputElement> = async e => {
        const selectedFiles = e.currentTarget.files;
        if (selectedFiles) {
            const photos = await [...selectedFiles].map(file =>
                addFile(file).then(uuid => ({ fileName: file.name, uuid })),
            ).awaitAll();

            const newValue = [...value, ...photos].slice(0, max)
            value = newValue;
            widget.onValueSet(context, newValue);
            if (e.currentTarget) e.currentTarget.value = '';
        }
        showError = true;
    };

    const remove = (photoId: string) => async () => {
        await removeFile(photoId);
        const newValue = value.toSpliced(value.findIndex(f => f.uuid === photoId), 1)
        value = newValue;
        widget.onValueSet(context, newValue);
        showError = true;
    };

    const invalid = $derived(widget.isError(context, value) && showError);
</script>

<Card class="w-full" size="sm">
    <CardContent class="gap-1">
        <FieldGroup>
            <Field data-invalid={invalid} orientation="responsive">
                <FieldTitle>{labelAndStar(widget, context, t)}</FieldTitle>
                {#if value.length === 0 || (multiple && value.length < max)}
                    <Button onclick={() => inputSelect?.click()}>
                        {multiple ? t.widget.selectPhotos : t.widget.selectPhoto}
                    </Button>
                    <Button onclick={() => inputCapture?.click()}>
                        {t.widget.capturePhoto}
                    </Button>
                {/if}
            </Field>
        </FieldGroup>
        {#if value.length}
            <div class="flex gap-1 overflow-x-auto w-full">
                {#each value as {fileName, uuid}}
                    <Item class="shrink w-fit">
                        {#await getFile(uuid) then photo}
                            {#if photo}
                                <ItemHeader class="inline">
                                    <img
                                        src={URL.createObjectURL(photo)}
                                        alt={t.widget.photo}
                                        width="128" height="128"
                                        class="aspect-square rounded-sm object-cover"
                                    />
                                </ItemHeader>
                            {/if}
                        {/await}
                        <ItemContent>
                            <ItemTitle class="break-all">{fileName}</ItemTitle>
                            <ItemActions>
                                <Button variant="destructive" onclick={remove(uuid)}>
                                    <ImageMinus /> {t.widget.remove_Photo}
                                </Button>
                            </ItemActions>
                        </ItemContent>
                    </Item>
                {/each}
            </div>
        {/if}
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
<input
    {accept}
    bind:this={inputCapture}
    capture="environment"
    class="hidden"
    {multiple}
    {onchange}
    type="file"
/>