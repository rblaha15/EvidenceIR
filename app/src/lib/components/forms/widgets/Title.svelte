<script generics="C" lang="ts">
    import type { Translations } from '$lib/translations';
    import { parseTitleId } from '$lib/helpers/globals';
    import type { TitleWidget } from '$lib/forms/Widget';
    import { cn } from '$lib/utils';

    interface Props {
        t: Translations;
        widget: TitleWidget<C>;
        context: C;
    }

    const { t, widget, context }: Props = $props();
</script>

{#await widget.text(t, context) then text}
    {#if text}
        {#if widget.level === 1}
            <h1 id={parseTitleId(text)} class={cn('mt-12', widget.class(context))}>{text}</h1>
        {:else if widget.level === 2}
            <h2 id={parseTitleId(text)} class={cn('mt-10', widget.class(context))}>{text}</h2>
        {:else if widget.level === 3}
            <h3 id={parseTitleId(text)} class={cn('mt-8', widget.class(context))}>{text}</h3>
        {:else if widget.level === 4}
            <h4 id={parseTitleId(text)} class={cn('mt-6', widget.class(context))}>{text}</h4>
        {:else if widget.level === 5}
            <h5 id={parseTitleId(text)} class={cn('mt-4', widget.class(context))}>{text}</h5>
        {:else if widget.level === 6}
            <h6 id={parseTitleId(text)} class={cn('mt-2', widget.class(context))}>{text}</h6>
        {/if}
    {/if}
{/await}