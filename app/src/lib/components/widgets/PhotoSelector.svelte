<script generics="C" lang="ts">
    import type { Translations } from '$lib/translations';
    import type { ChangeEventHandler } from 'svelte/elements';
    import { addFile, getFile, removeFile } from '$lib/components/widgets/File.svelte';
    import Button from '$lib/components/Button.svelte';
    import { type Files, labelAndStar, type PhotoSelectorWidget } from '$lib/forms/Widget';
    import { ImageMinus } from "@lucide/svelte";

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
</script>

<div class="flex gap-1 flex-col">
    <div>{labelAndStar(widget, context, t)}</div>
    <div class="flex gap-4 flex-col items-start">
        {#if value.length === 0 || (multiple && value.length < max)}
            <div class="flex gap-4">
                <Button text={multiple ? t.widget.selectPhotos : t.widget.selectPhoto}
                        variant="outline" onclick={() => inputSelect?.click()} />
                <Button text={t.widget.capturePhoto}
                        variant="outline" onclick={() => inputCapture?.click()} />
            </div>
        {/if}

        {#if value.length}
            <ul class="list-group">
                {#each value as { fileName, uuid }}
                    <li class="flex w-full items-center list-group-item gap-4">
                        {#await getFile(uuid) then photo}
                            {#if photo}
                                <img class="grow object-fit-contain shrink" style="max-height: 256px; min-width: 0"
                                     src={URL.createObjectURL(photo)} alt={t.widget.photo}>
                            {/if}
                        {/await}
                        <div class="flex flex-col gap-4 text-center">
                            <span style="word-break: break-all">{fileName}</span>
                            <Button text={t.widget.remove_Photo} icon={ImageMinus} variant="destructive"
                                    onclick={remove(uuid)} />
                        </div>
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
    <input
        {accept}
        bind:this={inputCapture}
        capture="environment"
        class="hidden"
        {multiple}
        {onchange}
        type="file"
    />
</div>