<script generics="D" lang="ts">
    import type { Translations } from '$lib/translations';
    import { CounterWidget } from '$lib/forms/Widget.svelte.js';
    import Icon from '$lib/components/Icon.svelte';

    interface Props {
        t: Translations;
        widget: CounterWidget<D>;
        data: D;
    }

    let { t, widget = $bindable(), data }: Props = $props();

    const uid = $props.id();
</script>

<div class="d-flex gap-1 flex-column">
    <div class="input-group d-flex flex-nowrap">
        <span class="input-group-text" id="label-{uid}">{widget.label(t, data)}</span>
        {#if !widget.lock(data)}
            <button class="btn btn-outline-primary" onclick={() => widget.mutateValue(data, v => v - 1)}
                    disabled={widget.value === widget.min(data)}
                    style="--bs-btn-padding-x: var(--bs-btn-padding-y)"
            >
                <Icon icon="remove" />
            </button>
        {/if}
        <span class="input-group-text input-group-input">{widget.value}</span>
        {#if !widget.lock(data)}
            <button class="btn btn-outline-primary" disabled={widget.value === widget.max(data)}
                    onclick={() => widget.mutateValue(data, v => v + 1)}
                    style="--bs-btn-padding-x: var(--bs-btn-padding-y)"
            >
                <Icon icon="add" />
            </button>
        {/if}
    </div>

    {#if widget.showError(data)}
        <span class="text-danger help-block">{widget.onError(t, data)}</span>
    {/if}
</div>
