<script lang="ts">
    import { Kbd } from '$lib/components/ui/kbd';
    import type { SearchItem } from '$lib/forms/Widget';
    import { cn } from '$lib/utils';
    import type { HTMLAnchorAttributes, HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';

    const all: {
        searchItem: SearchItem,
        forceOneLine?: boolean,
    } & ({
        element: 'div',
    } & HTMLAttributes<HTMLDivElement> | {
        element: 'button',
    } & HTMLButtonAttributes | {
        element: 'anchor',
    } & HTMLAnchorAttributes) = $props();

    const { searchItem, forceOneLine, class: klass, ...rest } = $derived(all);

    const itemClass = $derived(cn('flex flex-col md:flex-row md:items-center w-full', klass));
</script>

{#snippet pieces()}
    {#each searchItem.pieces as piece}
        {@const Icon = piece.icon}
        <p class={cn(
            'flex items-center gap-1 w-full md:w-(--width)',
            { 'not-first:not-md:hidden whitespace-nowrap overflow-hidden text-ellipsis': forceOneLine },
            piece.class,
        )} style="--width: {(piece.width ?? 1 / searchItem.pieces.length) * 100}%">
            <Icon class={[{ 'text-danger': piece.danger, 'text-warning-alt': piece.warning }, 'size-4']} />
            {piece.text}
            {#if piece.kbd}
                <Kbd>{piece.kbd}</Kbd>
            {/if}
        </p>
    {/each}
{/snippet}

{#if rest.element == 'div'}
    <div class={itemClass} {...rest}>{@render pieces()}</div>
{:else if rest.element == 'button'}
    <button class={itemClass} {...rest}>{@render pieces()}</button>
{:else if rest.element == 'anchor'}
    <a class={itemClass} {...rest}>{@render pieces()}</a>
{/if}