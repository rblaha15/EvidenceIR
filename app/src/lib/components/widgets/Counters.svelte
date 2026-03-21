<script generics="C, I extends string" lang="ts">
    import type { Translations } from '$lib/translations';
    import { CountersWidget, type Rec } from '$lib/forms/Widget.svelte.js';
    import Button from '$lib/components/Button.svelte';

    interface Props {
        t: Translations;
        widget: CountersWidget<C, I>;
        context: C;
        value: Rec<I>;
        showAllErrors: boolean;
    }

    let { t, widget, value = $bindable(), context, showAllErrors }: Props = $props();
    let showError = $derived(showAllErrors);

    const sum = $derived(value.getValues().reduce((v, acc) => acc + v, 0));

    const uid = $props.id();
    const inc = (option: I) => () => {
        const newValue = { ...value, [option]: value[option] + 1 };
        value = newValue;
        widget.onValueSet(context, newValue);
        showError = true;
    };
    const dec = (option: I) => () => {
        const newValue = { ...value, [option]: value[option] - 1 };
        value = newValue;
        widget.onValueSet(context, newValue);
        showError = true;
    };
</script>

<div class="d-flex gap-1 flex-column">
    <div>{widget.label(t, context)}</div>
    <div class="input-group input-group-grid" style="--grid-cols: 4">
        {#each value.entries() as [option, number]}
            <Button label="subtract" color="primary" outline square icon="remove"
                    onclick={dec(option)} disabled={number === 0} class="first" />
            <span class="input-group-text input-group-input">{number}</span>
            <Button label="add" color="primary" outline square icon="add"
                    onclick={inc(option)} disabled={sum === widget.max(context)} />
            <div class="input-group-text last" id="label-{uid}">{widget.get(t, option)}</div>
        {/each}
    </div>

    {#if widget.isError(context, value) && showError}
        <span class="text-danger">{widget.onError(t, context)}</span>
    {/if}
</div>
