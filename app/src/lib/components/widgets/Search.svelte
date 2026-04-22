<script generics="C, T" lang="ts">
    import type { Translations } from '$lib/translations';
    import { browser } from '$app/environment';
    import type { ClassValue, MouseEventHandler } from 'svelte/elements';
    import { derived, writable } from 'svelte/store';
    import { labelAndStar, type SearchItem, type SearchWidget } from '$lib/forms/Widget';
    import { Eraser, Search } from "@lucide/svelte";
    import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "$lib/components/ui/input-group";
    import { Field, FieldError, FieldLabel } from "$lib/components/ui/field";

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
        $search = value ? widget.getSearchItem(value, t, context).pieces.filter(p => !p.notForSearchText).map(p => p.text).join(' ') : '';
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

    let focused = $state(false);
    let hideRequest = $state(false);
    const hide = () => {
        hideRequest = true;
        setTimeout(() => {
            if (!hideRequest) return;
            hideRequest = false;
            focused = false;
        }, 100);
    };
    const show = () => {
        hideRequest = false;
        focused = true;
    };
    const clear = () => {
        value = null;
        widget.onValueSet(context, null);
        showError = true;
        hideRequest = false;
        focused = false;
    };
    const onItemClick = (item: T): MouseEventHandler<HTMLButtonElement | HTMLAnchorElement> => e => {
        e.preventDefault();
        value = item;
        widget.onValueSet(context, item);
        showError = true;
        focused = false;
    }

    const wide = browser ? window.matchMedia('(min-width: 768px)').matches : false;

    const invalid = $derived(widget.isError(context, value) && showError);

    const showAbove = $derived(!widget.inline(context));

    const id = $props.id();
</script>

{#snippet itemPieces(searchItem: SearchItem, klass: ClassValue)}
    {#each searchItem.pieces as piece}
        <p class={['items-center gap-1', klass, piece.class]}
           style="width: {wide ? (piece.width ?? 1 / searchItem.pieces.length) * 100 : 100}%"
        >
            <piece.icon class={[{ 'text-destructive': piece.destructive, 'text-warning': piece.warning }, 'size-4']} />
            {piece.text}
        </p>
    {/each}
{/snippet}

{#snippet eraser()}
    {#if value}
        <InputGroupAddon align="inline-end">
            <InputGroupButton size="icon-sm" onclick={clear}>
                <Eraser />
                <span class="sr-only">{t.widget.clearSelection}</span>
            </InputGroupButton>
        </InputGroupAddon>
    {/if}
{/snippet}

{#snippet selectedItem()}
    {#if value && !focused}
        <div class="w-full text-base md:text-sm absolute z-2 py-1.25 md:py-1.75 pointer-events-none top-0 h-9 pl-8.5 pr-14">
            <div
                class="flex flex-col md:flex-row md:items-center"
            >
                {@render itemPieces(
                    widget.getSearchItem(value, t, context),
                    'hidden first:flex md:flex items-center gap-1 whitespace-nowrap overflow-hidden first:text-ellipsis',
                )}
            </div>
        </div>
    {/if}
{/snippet}

{#snippet items(filtered: T[])}
    <div class="w-full text-base md:text-sm
        z-4 overflow-y-auto shadow-lg mb-2 border-t-0 bg-searchbox border-input rounded-2xl border rounded-t-none
        data-[above=true]:max-h-[90vh] data-[above=true]:absolute
    " data-above={showAbove}>
        {#each filtered as item}
            {@const searchItem = widget.getSearchItem(item, t, context)}
            {@const props = {
                class: 'flex flex-col md:flex-row md:items-center py-2 min-h-5 border-b border-input pl-8.5 pr-3 md:pr-14 w-full cursor-pointer',
                'aria-disabled': searchItem.disabled,
                onclick: onItemClick(item),
            }}
            {#if searchItem.href}
                <a href={searchItem.href ?? '#'} {...props}>
                    {@render itemPieces(searchItem, 'flex')}
                </a>
            {:else}
                <button {...props}>
                    {@render itemPieces(searchItem, 'flex')}
                </button>
            {/if}
        {:else}
            <div class="h-9 pl-8.5 pr-3 md:pr-14 flex flex-row items-center text-muted-foreground">Nenalezeno</div>
        {/each}
    </div>
{/snippet}

<div class="flex flex-col gap-1 w-full">
    <div class="relative" onfocusin={show} onfocusout={hide}>
        <Field class="w-auto" data-invalid={invalid} orientation="vertical">
            {#if widget.label(t, context)}
                <FieldLabel class="grow-0!" for="input-{id}">
                    <Search /> {labelAndStar(widget, context, t)}
                </FieldLabel>
            {/if}
            <InputGroup class={["grow border-input! ring-0! rounded-2xl relative", {
                'rounded-b-none': focused && $filtered != null,
            }]}>
                <InputGroupAddon align="inline-start">
                    <Search />
                </InputGroupAddon>
                <InputGroupInput
                    autofocus={widget.inline(context)}
                    oninput={e => $search = e.currentTarget.value}
                    type={widget.type(context)}
                    value={focused ? $search : value ? ' ' : ''}
                />
                {@render eraser()}
                {@render selectedItem()}
            </InputGroup>
        </Field>

        {#if focused && $filtered != null}
            {@render items($filtered)}
        {/if}
    </div>

    {#if invalid}
        <FieldError>{widget.onError(t, context)}</FieldError>
    {/if}
</div>