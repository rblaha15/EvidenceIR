<script generics="D" lang="ts">
    import type { Translations } from '$lib/translations';
    import { TitleWidget } from '$lib/forms/Widget.svelte.js';
    import { parseTitleId } from '$lib/helpers/globals';

    interface Props {
        t: Translations;
        widget: TitleWidget<D>;
        data: D;
    }

    const { t, widget, data }: Props = $props();
</script>

{#await widget.text(t, data) then text}
    {#if text}
        {@const attrs = { id: parseTitleId(text), class: [widget.class(data), 'm-0'] }}
        {#if widget.level === 1}
            <h1 {...attrs}>{text}</h1>
        {:else if widget.level === 2}
            <h2 {...attrs}>{text}</h2>
        {:else if widget.level === 3}
            <h3 {...attrs}>{text}</h3>
        {:else if widget.level === 4}
            <h4 {...attrs}>{text}</h4>
        {:else if widget.level === 5}
            <h5 {...attrs}>{text}</h5>
        {:else if widget.level === 6}
            <h6 {...attrs}>{text}</h6>
        {/if}
    {/if}
{/await}