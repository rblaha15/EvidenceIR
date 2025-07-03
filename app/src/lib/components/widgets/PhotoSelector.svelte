<script lang="ts" module>
    import { v4 as uuid } from 'uuid';
    import { openDB } from 'idb';
    import { browser } from '$app/environment';

    const db = browser ? openDB<{
        photos: {
            key: string;
            value: string;
        };
    }>('photo-selector', 1, {
        upgrade: db => {
            if (!db.objectStoreNames.contains('photos'))
                db.createObjectStore('photos');
        },
    }) : undefined;

    export const addPhoto = (photo: string) =>
        uuid().also(async id => await (await db!).add('photos', photo, id));
    export const removePhoto = async (id: string) =>
        await (await db!).delete('photos', id);
    export const removeAllPhotos = async () =>
        await (await db!).clear('photos');
    export const getPhoto = async (id: string) =>
        await (await db!).get('photos', id);
</script>

<script generics="D" lang="ts">
    import type { Translations } from '$lib/translations';
    import { labelAndStar, type PhotoSelectorWidget } from '$lib/forms/Widget.svelte.js';
    import type { ChangeEventHandler } from 'svelte/elements';

    interface Props {
        t: Translations;
        widget: PhotoSelectorWidget<D>;
        data: D;
    }

    let { t, widget = $bindable(), data }: Props = $props();

    let inputSelect = $state<HTMLInputElement>();
    let inputCapture = $state<HTMLInputElement>();
    const multiple = $derived(widget.multiple(data));
    const max = $derived(widget.max(data));

    const onchange: ChangeEventHandler<HTMLInputElement> = async e => {
        const files = e.currentTarget.files;
        if (files) {
            const photoStrings = await [...files].map(file => new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (typeof reader.result != 'string') return reject();
                    resolve(addPhoto(reader.result));
                };
                reader.readAsDataURL(file);
            })).awaitAll();

            widget.mutateValue(data, v => [...v, ...photoStrings].slice(0, max));
            if (e.currentTarget) e.currentTarget.value = '';
        }
    };

    const remove = (photoId: string) => async () => {
        await removePhoto(photoId);
        widget.mutateValue(data, v => v.toggle(photoId));
    };
</script>

<div class="d-flex gap-1 flex-column">
    <div>{labelAndStar(widget, data, t)}</div>
    <div class="d-flex gap-3 flex-column">
        {#if widget.value.length === 0 || (multiple && widget.value.length < max)}
            <div class="d-flex gap-3">
                <button
                    type="button"
                    class="btn btn-outline-primary"
                    onclick={() => inputSelect?.click()}
                >
                    {multiple ? t.selectPhoto : t.selectPhotos}
                </button>
                <button
                    type="button"
                    class="btn btn-outline-primary"
                    onclick={() => inputCapture?.click()}
                >
                    {multiple ? t.capturePhoto : t.capturePhotos}
                </button>
            </div>
        {/if}

        {#if widget.value.length}
            <ul class="list-group">
                {#each widget.value as photoId}
                    <li class="d-flex w-100 align-items-center list-group-item">
                        {#await getPhoto(photoId) then photo}
                            <img class="flex-grow-1 object-fit-contain flex-shrink-1" style="max-height: 256px; min-width: 0"
                                 src={photo} alt="Fotografie">
                        {/await}
                        <button class="btn text-danger ms-3" onclick={remove(photoId)}><i class="my-1 bi-trash"></i> {t.remove}</button>
                    </li>
                {/each}
            </ul>
        {/if}
    </div>
    {#if !widget.value.length}
        <div>{t.noPhotos}</div>
    {/if}

    {#if widget.showError(data)}
        <p class="text-danger">{t.get(widget.onError(data, t))}</p>
    {/if}

    <input
        accept="image/*"
        bind:this={inputSelect}
        class="d-none"
        {multiple}
        {onchange}
        type="file"
    />
    <input
        accept="image/*"
        bind:this={inputCapture}
        capture="environment"
        class="d-none"
        {multiple}
        {onchange}
        type="file"
    />
</div>