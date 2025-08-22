<script generics="D" lang="ts">
    import type { Translations } from '$lib/translations';
    import { CounterWidget } from '$lib/forms/Widget.svelte.js';

    interface Props {
        t: Translations;
        widget: CounterWidget<D>;
        data: D;
    }

    let { t, widget = $bindable(), data }: Props = $props();

    const uid = $props.id();
</script>

<div class="d-flex gap-1 flex-column">
    <div class="input-group flex-nowrap" style="width: min-content">
        <span class="input-group-text" style="width: max-content" id="label-{uid}">{widget.label(t, data)}</span>
        <button class="btn btn-outline-primary" onclick={() => widget.mutateValue(data, v => v - 1)}
                disabled={widget.value === widget.min(data)}
        ><strong>-</strong></button>
        <span class="input-group-text input-group-input">{widget.value}</span>
        <button class="btn btn-outline-primary" onclick={() => widget.mutateValue(data, v => v + 1)}
                disabled={widget.value === widget.max(data)}
        ><strong>+</strong></button>
    </div>

    {#if widget.showError(data)}
        <span class="text-danger help-block">{widget.onError(t, data)}</span>
    {/if}
</div>
