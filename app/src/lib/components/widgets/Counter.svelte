<script generics="C" lang="ts">
    import type { Translations } from '$lib/translations';
    import Icon from '$lib/components/Icon.svelte';
    import type { CounterWidget } from '$lib/forms/Widget';

    interface Props {
        t: Translations;
        widget: CounterWidget<C>;
        context: C;
        value: number;
        showAllErrors: boolean;
    }

    let { t, widget, value = $bindable(), context, showAllErrors }: Props = $props();
    let showError = $derived(showAllErrors);

    const uid = $props.id();
    const inc = () => {
        const newValue = value + 1;
        value = newValue;
        widget.onValueSet(context, newValue);
        showError = true;
    };
    const dec = () => {
        const newValue = value - 1;
        value = newValue;
        widget.onValueSet(context, newValue);
        showError = true;
    };
</script>

<div class="flex gap-1 flex-column">
    <div class="input-group flex flex-nowrap">
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

    {#if widget.isError(context, value) && showError}
        <span class="text-danger">{widget.onError(t, context)}</span>
    {/if}
</div>
