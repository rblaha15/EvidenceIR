<script generics="C, I1 extends string, I2 extends string" lang="ts">
    import { onMount, untrack } from 'svelte';
    import type { Action } from 'svelte/action';
    import type { Translations } from '$lib/translations';
    import { type Arr, type DoubleChooserWidget, labelAndStar, type Pair } from '$lib/forms/Widget.svelte.js';
    import type { ChangeEventHandler } from 'svelte/elements';

    interface Props {
        t: Translations;
        widget: DoubleChooserWidget<C, I1, I2>;
        context: C;
        value: Pair<I1, I2>;
        showAllErrors: boolean;
    }

    let { t, widget, value = $bindable(), context, showAllErrors }: Props = $props();
    let showError = $derived(showAllErrors);

    let other1 = $state([] as Arr<I1>);
    let options1 = $state([] as Arr<I1>);
    const onChange1: ChangeEventHandler<HTMLSelectElement> = e => {
        const target = e.currentTarget;
        const option = target.value;
        if (option === 'otherOptions') {
            e.preventDefault();
            options1 = [...options1, ...other1];
            other1 = [];
            setTimeout(() => target.showPicker())
        } else {
            const newValue = { ...value, first: option as I1 };
            value = newValue;
            widget.onValueSet(context, newValue);
            showError = true;
        }
    };
    $effect(() => {
        options1 = widget.options1(context);
        other1 = widget.otherOptions1(context);
        untrack(() => {
            if (value.first && other1.includes(value.first)) {
                options1 = [...options1, ...other1];
                other1 = [];
            }
        })
    });

    let other2 = $state([] as Arr<I2>);
    let options2 = $state([] as Arr<I2>);
    const onChange2: ChangeEventHandler<HTMLSelectElement> = e => {
        const target = e.currentTarget;
        const option = target.value;
        if (option === 'otherOptions') {
            e.preventDefault();
            options2 = [...options2, ...other2];
            other2 = [];
            setTimeout(() => target.showPicker())
        } else {
            const newValue = { ...value, second: option as I2 };
            value = newValue;
            widget.onValueSet(context, newValue);
            showError = true;
        }
    };
    $effect(() => {
        options2 = widget.options2(context);
        other2 = widget.otherOptions2(context);
        untrack(() => {
            if (value.second && other2.includes(value.second)) {
                options2 = [...options2, ...other2];
                other2 = [];
            }
        })
    });

    let mounted = false;
    onMount(() => mounted = true);
    const Select: Action<HTMLSelectElement> = target => {
        if (mounted && !target.disabled) {
            showError = false;
            target.showPicker();
        }
    };
</script>

{#snippet showGroups(other: (Arr<I1> | Arr<I2>), options: (Arr<I1> | Arr<I2>))}
    <option class="d-none" value='notChosen'>{t.widget.notChosen}</option>
    {#each options as option}
        <option value={option}>{widget.get(t, option)}</option>
    {/each}
    {#if other.length}
        <option value='otherOptions'>{t.widget.otherOptions}…</option>
    {/if}
{/snippet}

<div class="d-flex gap-1 flex-column">
    <div class="input-group">
        <label class="form-floating d-block left">
            <select class="form-select" disabled={widget.lock1(context)}
                    onchange={onChange1} value={value.first ?? 'notChosen'}>
                {@render showGroups(other1, options1)}
            </select>
            <label for="">{labelAndStar(widget, context, t)}</label>
        </label>
        {#if value.first != null && widget.options2(context).length > 0}
            <select
                class="form-select right"
                id={labelAndStar(widget, context, t)}
                value={value.second ?? 'notChosen'}
                disabled={widget.options2(context).length < 2 || widget.lock2(context)}
                onchange={onChange2}
                use:Select
            >
                {@render showGroups(other2, options2)}
            </select>
        {/if}
    </div>
    {#if widget.isError(context, value) && showError}
        <span class="text-danger">{widget.onError(t, context)}</span>
    {/if}
</div>

<style>
    .left {
        width: 70%;
        max-width: 70%;
    }

    .right {
        width: 30%;
    }
</style>
