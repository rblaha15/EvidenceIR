<script generics="D, T" lang="ts">
    import type { Translations } from '$lib/translations';
    import { labelAndStar, type SearchWidget } from '$lib/forms/Widget.svelte.js';
    import { browser } from '$app/environment';
    import type { ClassValue } from 'svelte/elements';
    import Icon from '$lib/components/Icon.svelte';

    export const textToFilter = (s: string) => s
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase();

    export const wordsToFilter = (s: string) => textToFilter(s)
        .split(' ')
        .map(it => it.replace('+', ' '));

    interface Props {
        t: Translations;
        widget: SearchWidget<D, T>;
        data: D;
        class?: ClassValue;
    }

    let { t, widget = $bindable(), data, class: klass = '' }: Props = $props();

    let search = $state('');

    $effect(() => {
        search = widget.value ? widget.getSearchItem(widget.value, t).pieces[0].text : '';
    });

    const all = $derived(widget.items(t, data));
    let filtered = $derived.by(() => {
        $all;
        search;
        return $all?.filter((item) =>
            wordsToFilter(search).every(
                filter => widget.getSearchItem(item, t).let(i => [
                    ...i.pieces.map(p => p.text),
                    ...i.otherSearchParts ?? [],
                ]).some(piece =>
                    wordsToFilter(piece).some(word => word.includes(filter)) ||
                    (filter.startsWith('!') ? textToFilter(piece).startsWith(filter.slice(1)) : textToFilter(piece).includes(filter)),
                ),
            ),
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
    };
    const show = () => {
        hideRequest = false;
        hidden = false;
    };
    const onClick = () => {
        widget.setValue(data, null);
        hideRequest = false;
        hidden = true;
    };

    const wide = browser ? window.matchMedia('(min-width: 768px)').matches : false;
</script>

<div class={["d-flex gap-1 flex-column", klass]}>
    <div class="position-relative" onfocusin={show} onfocusout={hide}>
        <label class="form-floating d-block">
            <input
                autofocus={widget.inline(data)}
                class="form-control border ps-3 bi"
                class:border-bottom-0={!hidden || widget.value}
                class:rb-0={!hidden}
                oninput={e => search = e.currentTarget.value}
                placeholder=" "
                type={widget.type(data)}
                value={hidden ? widget.value ? ' ' : '' : search}
            />
            <label for="">
                <Icon icon="search" />
                {labelAndStar(widget, data, t)}
            </label>
            <button aria-label={t.widget.clearSelection} class="btn py-1 px-2 m-1" class:d-none={!widget.value} onclick={onClick}>
                <Icon icon="clear" />
            </button>
        </label>

        {#if !hidden}
            <div class="list-group z-3 w-100 overflow-y-auto shadow-lg mb-2" class:options={!widget.inline(data)}>
                {#each filtered as item, i}
                    {@const searchItem = widget.getSearchItem(item, t)}
                    <a
                        tabindex="0"
                        class="list-group-item-action list-group-item d-flex flex-column flex-md-row flex-row align-items-md-center"
                        class:rt-0={i === 0}
                        href={searchItem.href ?? '#'}
                        class:disabled={searchItem.disabled}
                        aria-disabled={searchItem.disabled}
                        onclick={(e) => {
                            e.preventDefault();
                            widget.setValue(data, item);
                            hidden = true
                        }}
                    >
                        {#each searchItem.pieces as piece}
                            <p class={['mb-0 w-md-100', `text-${piece.color}`]}
                               style="flex: none; width: {wide ? (piece.width ?? 1 / searchItem.pieces.length) * 100 : 100}%"
                            >
                                <Icon icon={piece.icon} class="text-{piece.iconColor}" />
                                {piece.text}
                            </p>
                        {/each}
                    </a>
                {:else}
                    <p class="rt-0 list-group-item-action list-group-item mb-0 disabled">Nenalezeno</p>
                {/each}
            </div>
        {/if}

        {#if widget.value && hidden}
            {@const searchItem = widget.getSearchItem(widget.value, t)}
            <div class="list-group w-100 z-2 selected" class:options={!widget.inline(data)}>
                <div
                    class="list-group-item-action list-group-item d-flex flex-column flex-md-row align-items-md-center rt-0"
                >
                    {#each searchItem.pieces as piece, j}
                        <p class={['mb-0 me-1 d-md-block', `text-${piece.color}`, { 'd-none': j !== 0 }]}
                           style="color: var(--bs-body-color); flex: none; width: {wide ? (piece.width ?? 1 / searchItem.pieces.length) * 100 : 100}%"
                        >
                            <Icon icon={piece.icon} class="text-{piece.iconColor}" />
                            {piece.text}
                        </p>
                    {/each}
                </div>
            </div>
        {/if}
    </div>

    {#if widget.showError(data)}
        <p class="text-danger">{widget.onError(t, data)}</p>
    {/if}
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

    .options {
        max-height: 90vh;
        position: absolute;
    }
</style>
