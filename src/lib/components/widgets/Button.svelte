<script generics="D" lang="ts">
    import type { Translations } from '$lib/translations';
    import { ButtonWidget } from '$lib/forms/Widget.svelte.js';
    import Icon from '$lib/components/Icon.svelte';

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
    <Icon {icon} />
    {widget.text(t, data)}
</button>