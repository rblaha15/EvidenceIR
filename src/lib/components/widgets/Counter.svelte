<script generics="C" lang="ts">
    import type { Translations } from '$lib/translations';
    import { CounterWidget } from '$lib/forms/Widget.svelte.js';
    import Icon from '$lib/components/Icon.svelte';

    interface Props {
        t: Translations;
        widget: CounterWidget<C>;
        context: C;
        value: number;
    }

    let { t, widget, value = $bindable(), context }: Props = $props();

    const uid = $props.id();
    const inc = () => {
        const newValue = value + 1;
        value = newValue;
        widget.onValueSet(context, newValue);
    };
    const dec = () => {
        const newValue = value - 1;
        value = newValue;
        widget.onValueSet(context, newValue);
    };
</script>

<div class="d-flex gap-1 flex-column">
    <div class="input-group d-flex flex-nowrap">
        <span class="input-group-text" id="label-{uid}">{widget.label(t, context)}</span>
        {#if !widget.lock(context)}
            <button class="btn btn-outline-primary" onclick={dec}
                    disabled={value === widget.min(context)}
                    style="--bs-btn-padding-x: var(--bs-btn-padding-y)"
            >
                <Icon icon="remove" />
            </button>
        {/if}
        <span class="input-group-text input-group-input">{value}</span>
        {#if !widget.lock(context)}
            <button class="btn btn-outline-primary" disabled={value === widget.max(context)}
                    onclick={inc}
                    style="--bs-btn-padding-x: var(--bs-btn-padding-y)"
            >
                <Icon icon="add" />
            </button>
        {/if}
    </div>

    {#if widget.showError(context, value)}
        <span class="text-danger help-block">{widget.onError(t, context)}</span>
    {/if}
</div>
