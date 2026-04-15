<script generics="C, I extends string" lang="ts">
    import type { Translations } from '$lib/translations';
    import type { ChangeEventHandler } from 'svelte/elements';
    import { untrack } from 'svelte';
    import { type Arr, type ChooserWidget, labelAndStar } from '$lib/forms/Widget';

    interface Props {
        t: Translations;
        widget: ChooserWidget<C, I>;
        context: C;
        value: I;
        showAllErrors: boolean;
    }

    let { t, widget, value = $bindable(), context, showAllErrors }: Props = $props();
    let showError = $derived(showAllErrors);

    let other = $state([] as Arr<I>);
    let options = $state([] as Arr<I>);
    const onChange: ChangeEventHandler<HTMLSelectElement> = e => {
        const target = e.currentTarget;
        const option = target.value;
        if (option === 'otherOptions') {
            e.preventDefault();
            options = [...options, ...other];
            other = [];
            setTimeout(() => target.showPicker());
        } else {
            value = option as I;
            widget.onValueSet(context, option as I);
            showError = true;
        }
    };
    $effect(() => {
        options = widget.options(context);
        other = widget.otherOptions(context);
        untrack(() => {
            if (value && other.includes(value)) {
                options = [...options, ...other];
                other = [];
            }
        });
    });
</script>

{#snippet showOptions()}
    <option class="hidden" value='notChosen'>{t.widget.notChosen}</option>
    {#each options as option}
        <option value={option}>{widget.get(t, option)}</option>
    {/each}
    {#if other.length}
        <option value='otherOptions'>{t.widget.otherOptions}…</option>
    {/if}
{/snippet}

<div class="flex gap-1 flex-column">
    {#if widget.compact(context)}
        <label class="input-group">
            <span class="input-group-text">{labelAndStar(widget, context, t)}</span>
            <select class="form-select flex-grow-1" value={value ?? 'notChosen'}
                    onchange={onChange} disabled={widget.lock(context)}>
                {@render showOptions()}
            </select>
        </label>
    {:else}
        <label class="form-floating block">
            <select class="form-select" value={value ?? 'notChosen'} onchange={onChange}
                    disabled={widget.lock(context)}>
                {@render showOptions()}
            </select>
            <label for="">{labelAndStar(widget, context, t)}</label>
        </label>
    {/if}

    {#if widget.isError(context, value) && showError}
        <span class="text-danger">{widget.onError(t, context)}</span>
    {/if}
</div>