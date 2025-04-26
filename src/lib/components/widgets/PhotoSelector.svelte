<script module lang="ts">
    import { storable } from "$lib/helpers/stores";
    import { v4 as uuid } from "uuid";
    import { get } from "svelte/store";

    const photoStore = (id: string) => storable<string>(`photo-${id}`)
    export const addPhoto = (photo: string) => {
        const id = uuid()
        const store = photoStore(id)
        store.set(photo)
        return id
    }
    export const removePhoto = (id: string) => {
        const store = photoStore(id)
        store.set(undefined)
        return id
    }
    export const getPhoto = (id: string) => {
        const store = photoStore(id)
        return get(store)
    }
</script>

<script generics="D" lang="ts">
    import type { Translations } from "$lib/translations";
    import { nazevSHvezdou, type PhotoSelectorWidget } from "$lib/Widget.svelte";
    import type { ChangeEventHandler } from "svelte/elements";
    import { derived as derivedStore } from "svelte/store";

    interface Props {
        t: Translations;
        widget: PhotoSelectorWidget<D>;
        data: D;
    }

    let { t, widget = $bindable(), data }: Props = $props();

    let input = $state<HTMLInputElement>()
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
        }
    }

    const photos = derivedStore(widget.value.map(photoId => photoStore(photoId)), (photos) => photos.zip(widget.value))
</script>

{#if widget.show(data)}
    <div>{nazevSHvezdou(widget, data, t)}</div>
    {#if widget.value.length === 0 || (multiple && widget.value.length < max)}
        <button
            type="button"
            class="btn btn-outline-primary"
            onclick={() => input?.click()}
        >
            {multiple ? t.addPhoto : t.addPhotos}
        </button>
    {/if}

    {#if widget.value}
        <ul class="list-group mt-3">
            {#each $photos as [photo, photoId]}
                <li class="d-flex w-100 align-items-center list-group-item">
                    <img class="flex-grow-1 object-fit-contain flex-shrink-1" style="max-height: 256px; min-width: 0"
                         src={photo} alt="Fotografie">
                    <button class="btn text-danger ms-3" onclick={() => widget.mutateValue(data, v => v.toggle(removePhoto(photoId)))}
                    ><i class="my-1 bi-trash"></i> {t.remove}
                    </button>
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
        capture="environment"
        class="d-none"
        type="file"
        bind:this={input}
        {onchange}
    />
{/if}