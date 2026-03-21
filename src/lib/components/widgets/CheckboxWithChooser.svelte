<script generics="C, I extends string" lang="ts">
    import type { Translations } from '$lib/translations';
    import { CheckboxWithChooserWidget, labelAndStar, type SeCh } from '$lib/forms/Widget.svelte.js';
    import type { Action } from 'svelte/action';
    import { onMount } from 'svelte';

    interface Props {
        t: Translations;
        widget: CheckboxWithChooserWidget<C, I>;
        context: C;
        value: SeCh<I>;
        showAllErrors: boolean;
    }

    let { t, widget, value = $bindable(), context, showAllErrors }: Props = $props();
    let showError = $derived(showAllErrors);

    const onChange = (
        e: Event & {
            currentTarget: HTMLSelectElement;
        },
    ) => {
        const newValue = { checked: true, chosen: e.currentTarget.value as I };
        value = newValue;
        widget.onValueSet(context, newValue);
        showError = true;
    };

    let mounted = false;
    onMount(() => (mounted = true));
    const Select: Action<HTMLSelectElement> = (e) => {
        if (mounted) e.showPicker();
    };

    const onClick = () => {
        const newValue = { ...value, checked: !value.checked };
        value = newValue;
        widget.onValueSet(context, newValue);
        showError = true;
    };

    const uid = $props.id();
</script>

<div class="d-flex gap-1 flex-column">
    <div class="input-group">
        <button aria-labelledby="label-{uid}" class="input-group-text input-group-input" onclick={onClick} tabindex="-1">
            <input bind:checked={value.checked} class="form-check-input m-0" role="button" type="checkbox" />
        </button>
        <label class="form-floating d-block" id="label-{uid}">
            {#if value.checked}
                <select class="form-select" value={value.chosen ?? 'notChosen'} onchange={onChange} use:Select>
                    <option class="d-none" value='notChosen'>{t.widget.notChosen}</option>
                    {#each widget.options(context) as moznost}
                        <option value={moznost}>{widget.get(t, moznost)}</option>
                    {/each}
                </select>
            {:else}
                <input type="text" placeholder={labelAndStar(widget, context, t)} readonly onclick={onClick}
                       class="form-control shadow-none input-group-text" role="button"
                       tabindex="-1" />
            {/if}
            <label for="">{labelAndStar(widget, context, t)}</label>
        </label>
    </div>

    {#if widget.isError(context, value) && showError}
        <span class="text-danger">{widget.onError(t, context)}</span>
    {/if}
</div>