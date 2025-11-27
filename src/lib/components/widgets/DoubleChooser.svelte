<script generics="D, I1 extends string, I2 extends string" lang="ts">
    import { onMount } from 'svelte';
    import type { Action } from 'svelte/action';
    import type { Translations } from '$lib/translations';
    import { type Arr, type DoubleChooserWidget, labelAndStar } from '$lib/forms/Widget.svelte.js';
    import type { ChangeEventHandler } from 'svelte/elements';

    interface Props {
        t: Translations;
        widget: DoubleChooserWidget<D, I1, I2>;
        data: D;
    }

    let { t, widget = $bindable(), data }: Props = $props();

    let other1 = $state([] as Arr<I1>);
    let options1 = $state([] as Arr<I1>);
    const onChange1: ChangeEventHandler<HTMLSelectElement> = e => {
        const target = e.currentTarget;
        const value = target.value;
        if (value === 'otherOptions') {
            e.preventDefault();
            options1 = [...options1, ...other1];
            other1 = [];
            setTimeout(() => target.showPicker())
        } else widget.mutateValue(data, v => ({ ...v, first: value as I1 }));
    };
    $effect(() => {
        options1 = widget.options1(data);
        other1 = widget.otherOptions1(data);
        new Promise(r => r(undefined)).then(() => {
            if (widget.value.first && other1.includes(widget.value.first)) {
                options1 = [...options1, ...other1];
                other1 = [];
            }
        })
    });

    let other2 = $state([] as Arr<I2>);
    let options2 = $state([] as Arr<I2>);
    const onChange2: ChangeEventHandler<HTMLSelectElement> = e => {
        const target = e.currentTarget;
        const value = target.value;
        if (value === 'otherOptions') {
            e.preventDefault();
            options2 = [...options2, ...other2];
            other2 = [];
            setTimeout(() => target.showPicker())
        } else widget.mutateValue(data, v => ({ ...v, second: value as I2 }));
    };
    $effect(() => {
        options2 = widget.options2(data);
        other2 = widget.otherOptions2(data);
        new Promise(r => r(undefined)).then(() => {
            if (widget.value.second && other2.includes(widget.value.second)) {
                options2 = [...options2, ...other2];
                other2 = [];
            }
        })
    });

    let mounted = false;
    onMount(() => mounted = true);
    const Select: Action<HTMLSelectElement> = target => {
        if (mounted && !target.disabled) target.showPicker();
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
            <select class="form-select" disabled={widget.lock1(data)}
                    onchange={onChange1} value={widget.value.first ?? 'notChosen'}>
                {@render showGroups(other1, options1)}
            </select>
            <label for="">{labelAndStar(widget, data, t)}</label>
        </label>
        {#if widget.value.first != null && widget.options2(data).length > 0}
            <select
                class="form-select right"
                id={labelAndStar(widget, data, t)}
                value={widget.value.second ?? 'notChosen'}
                disabled={widget.options2(data).length < 2 || widget.lock2(data)}
                onchange={onChange2}
                use:Select
            >
                {@render showGroups(other2, options2)}
            </select>
        {/if}
    </div>
    {#if widget.showError(data)}
        <p class="text-danger">{widget.onError(t, data)}</p>
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
