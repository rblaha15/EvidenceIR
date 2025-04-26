<script lang="ts" module>
    import { v4 as uuid } from "uuid";
    import { openDB } from 'idb';
    import { browser } from "$app/environment";

    const db = browser ? await openDB<{
        photos: {
            key: string;
            value: string;
        };
    }>('photo-selector', 1, {
        upgrade: db => {
            if (!db.objectStoreNames.contains('photos'))
                db.createObjectStore('photos');
        },
    }) : undefined

    export const addPhoto = (photo: string) =>
        uuid().also(id => db!.add('photos', photo, id))
    export const removePhoto = (id: string) =>
        db!.delete('photos', id)
    export const removeAllPhotos = () =>
        db!.clear('photos')
    export const getPhoto = (id: string) =>
        db!.get('photos', id)
</script>

<script generics="D" lang="ts">
    import type { Translations } from "$lib/translations";
    import { nazevSHvezdou, type PhotoSelectorWidget } from "$lib/Widget.svelte";
    import type { ChangeEventHandler } from "svelte/elements";

    interface Props {
        t: Translations;
        widget: PhotoSelectorWidget<D>;
        data: D;
    }

    let { t, widget = $bindable(), data }: Props = $props();

    let inputSelect = $state<HTMLInputElement>()
    let inputCapture = $state<HTMLInputElement>()
    const multiple = $derived(widget.multiple(data))
    const max = $derived(widget.max(data))

    const onchange: ChangeEventHandler<HTMLInputElement> = async e => {
        const files = e.currentTarget.files
        if (files) {
            const photoStrings = await [...files].map(file => new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (typeof reader.result != 'string') return reject()
                    resolve(addPhoto(reader.result));
                };
                reader.readAsDataURL(file);
            })).awaitAll()

            widget.mutateValue(data, v => [...v, ...photoStrings].slice(0, max))
            if (e.currentTarget) e.currentTarget.value = ''
        }
    }

    const remove = (photoId: string) => async () => {
        await removePhoto(photoId);
        widget.mutateValue(data, v => v.toggle(photoId))
    }
</script>

{#if widget.show(data)}
    <div>{nazevSHvezdou(widget, data, t)}</div>
    {#if widget.value.length === 0 || (multiple && widget.value.length < max)}
        <div class="d-flex">
            <button
                type="button"
                class="btn btn-outline-primary"
                onclick={() => inputSelect?.click()}
            >
                {multiple ? t.selectPhoto : t.selectPhotos}
            </button>
            <button
                type="button"
                class="btn btn-outline-primary ms-2"
                onclick={() => inputCapture?.click()}
            >
                {multiple ? t.capturePhoto : t.capturePhotos}
            </button>
        </div>
    {/if}

    {#if widget.value}
        <ul class="list-group mt-3">
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
    {:else}
        <div class="mt-1">{t.noPhotos}</div>
    {/if}

    {#if widget.showError(data)}
        <p class="text-danger mt-1">{t.get(widget.onError(data, t))}</p>
    {/if}

    <div class="mb-3"></div>

    <input
        accept="image/*"
        {multiple}
        class="d-none"
        type="file"
        bind:this={inputSelect}
        {onchange}
    />
    <input
        accept="image/*"
        {multiple}
        capture="environment"
        class="d-none"
        type="file"
        bind:this={inputCapture}
        {onchange}
    />
{/if}