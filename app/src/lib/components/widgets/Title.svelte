<script generics="C" lang="ts">
    import type { Translations } from '$lib/translations';
    import { parseTitleId } from '$lib/helpers/globals';
    import type { TitleWidget } from '$lib/forms/Widget';

    interface Props {
        t: Translations;
        widget: TitleWidget<C>;
        context: C;
    }

    const { t, widget, context }: Props = $props();
</script>

{#await widget.text(t, context) then text}
    {#if text}
        {@const props = { id: parseTitleId(text), class: widget.class(context) }}
        {#if widget.level === 1}
            <h1 {...props}>{text}</h1>
        {:else if widget.level === 2}
            <h2 {...props}>{text}</h2>
        {:else if widget.level === 3}
            <h3 {...props}>{text}</h3>
        {:else if widget.level === 4}
            <h4 {...props}>{text}</h4>
        {:else if widget.level === 5}
            <h5 {...props}>{text}</h5>
        {:else if widget.level === 6}
            <h6 {...props}>{text}</h6>
        {/if}
    {/if}
{/await}