<script generics="D, T" lang="ts">
    import type { Translations } from '$lib/translations';
    import { labelAndStar, type SearchWidget } from '$lib/Widget.svelte.js';
    import { browser } from '$app/environment';

    export const wordsToFilter = (s: string) => s
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .split(' ')

    interface Props {
        t: Translations;
        widget: SearchWidget<D, T>;
        data: D;
    }

    let { t, widget = $bindable(), data }: Props = $props();

    let search = $state(widget.value ? t.get(widget.getSearchItem(widget.value).pieces[0].text) : '');

    const all = $derived(widget.items(data));
    let filtered = $derived.by(() => {
        all; search;
        return all?.filter((item) =>
            wordsToFilter(search).every(
                filter => widget.getSearchItem(item).pieces.some(piece =>
                    wordsToFilter(t.get(piece.text)).some(word => word.includes(filter))
                )
            )
        ) ?? [];
    });
    let hidden = $state(true);
    let hideRequest = $state(false);
    const hide = () => {
        hideRequest = true;
        setTimeout(() => {
            if (!hideRequest) return;
            hideRequest = false;
            hidden = true;
        }, 100);
    }
    const show = () => {
        hideRequest = false;
        hidden = false;
    }
    const onClick = () => {
        widget.setValue(data, null);
        hideRequest = false;
        hidden = true;
    }

    const wide = browser ? window.matchMedia('(min-width: 768px)').matches : false;
</script>

<div class="position-relative" onfocusin={show} onfocusout={hide}>
    <label class="form-floating d-block">
        <input
            value={hidden ? widget.value ? ' ' : '' : search}
            oninput={e => search = e.currentTarget.value}
            class="form-control border ps-3 bi"
            class:border-bottom-0={!hidden || widget.value}
            class:rb-0={!hidden}
            placeholder=""
            type={widget.type(data, t)}
        />
        <label for="">{labelAndStar(widget, data, t)}</label>
        <button class="btn py-1 px-2 m-1" class:d-none={!widget.value} aria-label={t.clearSelection} onclick={onClick}><i class="bi bi-eraser"></i></button>
    </label>

    {#if !hidden}
        <div class="list-group position-absolute z-3 w-100 shadow-lg pb-2">
            {#each filtered as item, i}
                {@const searchItem = widget.getSearchItem(item)}
                <a
                    tabindex="0"
                    class="list-group-item-action list-group-item d-flex flex-column flex-md-row flex-row align-items-md-center"
                    class:rt-0={i === 0}
                    href={searchItem.href ?? '#'}
                    onclick={(e) => {
                        e.preventDefault();
                        widget.setValue(data, item);
                        hidden = true
                    }}
                >
                    {#each searchItem.pieces as piece}
                        <p class="mb-0 w-md-100"
                           style="flex: none; width: {wide ? (piece.width ?? 1 / searchItem.pieces.length) * 100 : 100}%"
                        >{t.get(piece.text)}</p>
                    {/each}
                </a>
            {:else}
                <p class="rt-0 list-group-item mb-0">Nenalezeno</p>
            {/each}
        </div>
    {/if}

    {#if widget.value && hidden}
        {@const searchItem = widget.getSearchItem(widget.value)}
        <div class="list-group w-100 position-absolute z-2 selected">
            <div
                class="list-group-item-action list-group-item d-flex flex-column flex-md-row align-items-md-center rt-0"
            >
                {#each searchItem.pieces as piece, j}
                    <p class="mb-0 me-1 d-md-block" class:d-none={j !== 0}
                       style="color: var(--bs-body-color); flex: none; width: {wide ? (piece.width ?? 1 / searchItem.pieces.length) * 100 : 100}%"
                    >{t.get(piece.text)}</p>
                {/each}
            </div>
        </div>
    {/if}

    {#if widget.showError(data)}
        <p class="text-danger mt-1">{t.get(widget.onError(data, t))}</p>
    {/if}

    <div class="mb-3"></div>
</div>
<style>
    .form-floating > button {
        position: absolute;
        right: var(--bs-border-width);
        top: calc(50% - var(--bs-body-font-size));
    }

    .rb-0 {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
    }

    .rt-0 {
        border-top-left-radius: 0 !important;
        border-top-right-radius: 0 !important;
    }

    .form-control:focus {
        box-shadow: none;
    }

    .selected {
        transform: translateY(calc(-100% + 1px));
        pointer-events: none;

        div {
            background: none;
            border-top: none;

            p {
                white-space: nowrap;
                overflow: hidden;
            }

            p:first-child {
                text-overflow: ellipsis;
            }
        }
    }
</style>
