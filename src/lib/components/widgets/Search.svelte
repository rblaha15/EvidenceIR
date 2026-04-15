<script generics="C, T" lang="ts">
    import type { Translations } from '$lib/translations';
    import { browser } from '$app/environment';
    import type { ClassValue } from 'svelte/elements';
    import Icon from '$lib/components/Icon.svelte';
    import { derived, writable } from 'svelte/store';
    import { labelAndStar, type SearchWidget } from '$lib/forms/Widget';

    export const textToFilter = (s: string) => s
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase();

    export const wordsToFilter = (s: string) => textToFilter(s)
        .split(' ')
        .map(it => it.replace('+', ' '));

    interface Props {
        t: Translations;
        widget: SearchWidget<C, T>;
        context: C;
        value: T | null;
        showAllErrors: boolean;
        class?: ClassValue;
    }

    let { t, widget, value = $bindable(), context, showAllErrors, class: klass = '' }: Props = $props();
    let showError = $derived(showAllErrors);

    let search = writable('');

    $effect(() => {
        $search = value ? widget.getSearchItem(value, t, context).pieces[0].text : '';
    });

    const original = widget.items(t, context);
    const found = writable(null as T[] | null);
    $effect(() => {
        let aborted = false;
        const promise = widget.search?.($search);
        promise?.then(items => {
            if (!aborted) found.set(items);
        });
        return () => {
            aborted = true;
        };
    });
    const filtered = widget.search
        ? found
        : derived([original, search], ([original, search]) => original?.filter((item) =>
            wordsToFilter(search).every(
                filter => widget.getSearchItem(item, t, context).let(i => [
                    ...i.pieces.map(p => p.text),
                    ...i.otherSearchParts ?? [],
                ]).some(piece =>
                    wordsToFilter(piece).some(word => word.includes(filter)) ||
                    (filter.startsWith('!') ? textToFilter(piece).startsWith(filter.slice(1)) : textToFilter(piece).includes(filter)),
                ),
            ),
        ) ?? []);

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
        value = null;
        widget.onValueSet(context, null);
        showError = true;
        hideRequest = false;
        hidden = true;
    };

    const wide = browser ? window.matchMedia('(min-width: 768px)').matches : false;
</script>

<div class={["d-flex gap-1 flex-column", klass]}>
    <div class="position-relative" onfocusin={show} onfocusout={hide}>
        <label class="form-floating d-block">
            <input
                autofocus={widget.inline(context)}
                class="form-control border ps-3 bi"
                class:border-bottom-0={(!hidden && $filtered != null) || value}
                class:rb-0={(!hidden && $filtered != null)}
                oninput={e => $search = e.currentTarget.value}
                placeholder=" "
                type={widget.type(context)}
                value={hidden ? value ? ' ' : '' : $search}
            />
            <label for="">
                <Icon icon="search" />
                {labelAndStar(widget, context, t)}
            </label>
            <button aria-label={t.widget.clearSelection} class="btn py-1 px-2 m-1" class:d-none={!value} onclick={onClick}>
                <Icon icon="clear" />
            </button>
        </label>

        {#if !hidden}
            <div class="list-group z-3 w-100 overflow-y-auto shadow-lg mb-2" class:options={!widget.inline(context)}>
                {#each $filtered as item, i}
                    {@const searchItem = widget.getSearchItem(item, t, context)}
                    <a
                        tabindex="0"
                        class="list-group-item-action list-group-item d-flex flex-column flex-md-row flex-row align-items-md-center"
                        class:rt-0={i === 0}
                        href={searchItem.href ?? '#'}
                        class:disabled={searchItem.disabled}
                        aria-disabled={searchItem.disabled}
                        onclick={(e) => {
                            e.preventDefault();
                            value = item;
                            widget.onValueSet(context, item);
                            showError = true;
                            hidden = true;
                        }}
                    >
                        {#each searchItem.pieces as piece}
                            <p class={['mb-0 w-md-100', `text-${piece.color}`, piece.class]}
                               style="flex: none; width: {wide ? (piece.width ?? 1 / searchItem.pieces.length) * 100 : 100}%"
                            >
                                <Icon icon={piece.icon} class="text-{piece.iconColor}" />
                                {piece.text}
                            </p>
                        {/each}
                    </a>
                {:else}
                    {#if $filtered != null}
                        <p class="rt-0 list-group-item-action list-group-item mb-0 disabled">Nenalezeno</p>
                    {/if}
                {/each}
            </div>
        {/if}

        {#if value && hidden}
            {@const searchItem = widget.getSearchItem(value, t, context)}
            <div class="list-group w-100 z-2 selected" class:options={!widget.inline(context)}>
                <div
                    class="list-group-item-action list-group-item d-flex flex-column flex-md-row align-items-md-center rt-0"
                >
                    {#each searchItem.pieces as piece, j}
                        <p class={['mb-0 me-1 d-md-block', `text-${piece.color}`, piece.class, { 'd-none': j !== 0 }]}
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

    {#if widget.isError(context, value) && showError}
        <span class="text-danger">{widget.onError(t, context)}</span>
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
