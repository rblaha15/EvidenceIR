<script generics="C" lang="ts">
    import type { Translations } from '$lib/translations';
    import type { ButtonWidget } from '$lib/forms/Widget';

    interface Props {
        t: Translations;
        widget: ButtonWidget<C>;
        context: C;
    }

    const { t, widget, context }: Props = $props();

    const Icon = $derived(widget.icon(context));
</script>

<button
    class="btn btn-{widget.color(context)} align-self-start"
    onclick={() => widget.onClick(context)}
>
    <Icon />
    {widget.text(t, context)}
</button>