<script generics="C, T" lang="ts">
    import { includeItem } from '$lib/components/forms/serach/logic';
    import SearchItem from '$lib/components/forms/serach/SearchItem.svelte';
    import SearchItems from '$lib/components/forms/serach/SearchItems.svelte';
    import { Field, FieldError, FieldLabel } from '$lib/components/ui/field';
    import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '$lib/components/ui/input-group';
    import { labelAndStar, type SearchWidget } from '$lib/forms/Widget';
    import type { Translations } from '$lib/translations';
    import { Eraser, Search } from '@lucide/svelte';
    import type { MouseEventHandler } from 'svelte/elements';
    import { derived, writable } from 'svelte/store';

    interface Props {
        t: Translations;
        widget: SearchWidget<C, T>;
        context: C;
        value: T | null;
        showAllErrors: boolean;
    }

    let { t, widget, value = $bindable(), context, showAllErrors }: Props = $props();
    let showError = $derived(showAllErrors);

    let search = writable('');

    $effect(() => {
        $search = value ? widget.getSearchItem(value, t, context).pieces.filter(p => !p.notForSearchText).map(p => p.text).join(' ') : '';
    });

    // svelte-ignore state_referenced_locally
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

    // svelte-ignore state_referenced_locally
    const filtered = widget.search
        ? found
        : derived([original, search], ([original, search]) => original != 'loading' ? original.filter(item =>
            includeItem(search, widget.getSearchItem(item, t, context).let(i => [
                ...i.pieces.map(p => p.text),
                ...i.otherSearchParts ?? [],
            ]))
        ) : 'loading' as const);

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
    };

    const invalid = $derived(widget.isError(context, value) && showError);

    const id = $props.id();
</script>

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
        <div
            class="w-full text-base md:text-sm absolute z-2 py-1.25 md:py-1.75 pointer-events-none top-0 h-9 pl-8.5 pr-14"
        >
            <SearchItem searchItem={widget.getSearchItem(value, t, context)} element="div" forceOneLine />
        </div>
    {/if}
{/snippet}


<div class="flex flex-col gap-1 w-full">
    <div class="relative" onfocusin={show} onfocusout={hide}>
        <Field class="w-auto" data-invalid={invalid} orientation="vertical">
            {#if widget.label(t, context)}
                <FieldLabel class="grow-0!" for="input-{id}">
                    {labelAndStar(widget, context, t)}
                </FieldLabel>
            {/if}
            <InputGroup class={["grow border-input! ring-0! rounded-2xl relative", {
                'rounded-b-none': focused && $filtered != null,
            }]}>
                <InputGroupAddon align="inline-start">
                    <Search />
                </InputGroupAddon>
                <InputGroupInput
                    oninput={e => $search = e.currentTarget.value}
                    type={widget.type(context)}
                    value={focused ? $search : value ? ' ' : ''}
                />
                {@render eraser()}
                {@render selectedItem()}
            </InputGroup>
        </Field>

        {#if focused && $filtered != null}
            <SearchItems
                items={$filtered} {t} getSearchItem={item => widget.getSearchItem(item, t, context)}
                {onItemClick}
                class="max-h-[90vh] absolute z-4 overflow-y-auto
                shadow-lg mb-2 border-t-0 bg-searchbox border-input rounded-2xl border rounded-t-none"
                itemClass="pl-8.5 pr-3 md:pr-14 border-b border-input"
                errorClass="border-none text-muted-foreground" />
        {/if}
    </div>

    {#if invalid}
        <FieldError>{widget.onError(t, context)}</FieldError>
    {/if}
</div>