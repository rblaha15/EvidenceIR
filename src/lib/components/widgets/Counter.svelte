<script generics="D" lang="ts">
    import type { Translations } from '$lib/translations';
    import { CounterWidget } from '$lib/Widget.svelte.js';

    interface Props {
        t: Translations;
        widget: CounterWidget<D>;
        data: D;
    }

    let { t, widget = $bindable(), data }: Props = $props();

    const uid = $props.id();
</script>

{#if widget.show(data)}
    <div class="input-group flex-nowrap" style="width: min-content">
        <span class="input-group-text" style="width: max-content" id="label-{uid}">{t.get(widget.label(data, t))}</span>
        <button class="btn btn-outline-primary" onclick={() => widget.mutateValue(data, v => v - 1)}
                disabled={widget.value === widget.min(data)}
        ><strong>-</strong></button>
        <span class="input-group-text input-group-input">{widget.value}</span>
        <button class="btn btn-outline-primary" onclick={() => widget.mutateValue(data, v => v + 1)}
                disabled={widget.value === widget.max(data)}
        ><strong>+</strong></button>
    </div>

    {#if widget.showError(data)}
        <span class="text-danger help-block">{t.get(widget.onError(data, t))}</span>
    {/if}

    <div class="mb-3"></div>
{/if}
