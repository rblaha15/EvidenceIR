<script generics="C" lang="ts">
    import type { Translations } from '$lib/translations';
    import Icon from '$lib/components/Icon.svelte';
    import type { ButtonWidget } from '$lib/forms/Widget';

    interface Props {
        t: Translations;
        widget: ButtonWidget<C>;
        context: C;
    }

    const { t, widget, context }: Props = $props();

    const icon = $derived(widget.icon(context));
</script>

<button
    class="btn btn-{widget.color(context)} align-self-start"
    onclick={() => widget.onClick(context)}
>
    <Icon {icon} />
    {widget.text(t, context)}
</button>