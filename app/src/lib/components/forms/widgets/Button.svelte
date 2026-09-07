<script generics="C" lang="ts">
    import type { Translations } from '$lib/translations';
    import type { ButtonWidget } from '$lib/forms/Widget';
    import { Button } from "$lib/components/ui/button";

    interface Props {
        t: Translations;
        widget: ButtonWidget<C>;
        context: C;
    }

    const { t, widget, context }: Props = $props();

    const Icon = $derived(widget.icon(context));
</script>

<Button
    class="self-start"
    variant={widget.variant(context)}
    size={widget.size(context)}
    onclick={() => widget.onClick(context)}
>
    {#if Icon}
        <Icon />
    {/if}
    {widget.text(t, context)}
</Button>