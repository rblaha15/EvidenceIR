<script generics="D" lang="ts">
    import type { Translations } from '$lib/translations';
    import { ButtonWidget } from '$lib/forms/Widget.svelte.js';

    interface Props {
        t: Translations;
        widget: ButtonWidget<D>;
        data: D;
    }

    const { t, widget, data }: Props = $props();

    const icon = $derived(widget.icon(data));
</script>

<button
    class="btn btn-{widget.color(data)} align-self-start"
    onclick={() => widget.onClick(data)}
>
    {#if icon}
        <span class="material-icons">{icon}</span>
    {/if}
    {widget.text(t, data)}
</button>