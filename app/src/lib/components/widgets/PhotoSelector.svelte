<script generics="D" lang="ts">
    import type { Translations } from '$lib/translations';
    import { type Files, labelAndStar, type PhotoSelectorWidget } from '$lib/forms/Widget.svelte.js';
    import type { ChangeEventHandler } from 'svelte/elements';
    import { getFile, addFile, removeFile } from '$lib/components/widgets/File.svelte';

    interface Props {
        t: Translations;
        widget: PhotoSelectorWidget<D>;
        data: D;
    }

    let { t, widget = $bindable(), data }: Props = $props();

    let inputSelect = $state<HTMLInputElement>();
    let inputCapture = $state<HTMLInputElement>();
    const accept = $derived(widget.accept(data));
    const multiple = $derived(widget.multiple(data));
    const max = $derived(widget.max(data));

    const onchange: ChangeEventHandler<HTMLInputElement> = async e => {
        const selectedFiles = e.currentTarget.files;
        if (selectedFiles) {
            const photos = await [...selectedFiles].map(file => new Promise<Files[number]>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (typeof reader.result != 'string') return reject();
                    addFile(reader.result).then(uuid => resolve({ fileName: file.name, uuid }));
                };
                reader.readAsDataURL(file);
            })).awaitAll();

            widget.mutateValue(data, v => [...v, ...photos].slice(0, max));
            if (e.currentTarget) e.currentTarget.value = '';
        }
    };

    const remove = (photoId: string) => async () => {
        await removeFile(photoId);
        widget.mutateValue(data, v => v.toSpliced(v.findIndex(f => f.uuid === photoId), 1));
    };
</script>

<div class="d-flex gap-1 flex-column">
    <div>{labelAndStar(widget, data, t)}</div>
    <div class="d-flex gap-3 flex-column align-items-start">
        {#if widget.value.length === 0 || (multiple && widget.value.length < max)}
            <div class="d-flex gap-3">
                <button
                    type="button"
                    class="btn btn-outline-primary"
                    onclick={() => inputSelect?.click()}
                >
                    {multiple ? t.widget.selectPhotos : t.widget.selectPhoto}
                </button>
                <button
                    type="button"
                    class="btn btn-outline-primary"
                    onclick={() => inputCapture?.click()}
                >
                    {t.widget.capturePhoto}
                </button>
            </div>
        {/if}

        {#if widget.value.length}
            <ul class="list-group">
                {#each widget.value as { fileName, uuid }}
                    <li class="d-flex w-100 align-items-center list-group-item gap-3">
                        {#await getFile(uuid) then photo}
                            <img class="flex-grow-1 object-fit-contain flex-shrink-1" style="max-height: 256px; min-width: 0"
                                 src={photo} alt={t.widget.photo}>
                        {/await}
                        <div class="d-flex flex-column gap-3 text-center">
                            <span style="word-break: break-all">{fileName}</span>
                            <button class="btn text-danger" onclick={remove(uuid)}><i class="my-1 bi-trash"></i> {t.widget.remove_Photo}</button>
                        </div>
                    </li>
                {/each}
            </ul>
        {/if}
    </div>

    {#if widget.showError(data)}
        <p class="text-danger">{widget.onError(t, data)}</p>
    {/if}

    <input
        {accept}
        bind:this={inputSelect}
        class="d-none"
        {multiple}
        {onchange}
        type="file"
    />
    <input
        {accept}
        bind:this={inputCapture}
        capture="environment"
        class="d-none"
        {multiple}
        {onchange}
        type="file"
    />
</div>