<script generics="D, I extends string" lang="ts">
    import type { Translations } from '$lib/translations';
    import { type Arr, type ChooserWidget, labelAndStar } from '$lib/forms/Widget.svelte.js';
    import type { ChangeEventHandler } from 'svelte/elements';

    interface Props {
        t: Translations;
        widget: ChooserWidget<D, I>;
        data: D;
    }

    let { t, widget = $bindable(), data }: Props = $props();

    let other = $state([] as Arr<I>);
    let options = $state([] as Arr<I>);
    const onChange: ChangeEventHandler<HTMLSelectElement> = e => {
        const target = e.currentTarget;
        const value = target.value;
        if (value === 'otherOptions') {
            e.preventDefault();
            options = [...options, ...other];
            other = [];
            setTimeout(() => target.showPicker());
        } else widget.setValue(data, value as I);
    };
    $effect(() => {
        options = widget.options(data);
        other = widget.otherOptions(data);
        new Promise(r => r(undefined)).then(() => {
            if (widget.value && other.includes(widget.value)) {
                options = [...options, ...other];
                other = [];
            }
        });
    });
</script>

{#snippet showOptions()}
    <option class="d-none" value='notChosen'>{t.widget.notChosen}</option>
    {#each options as option}
        <option value={option}>{widget.get(t, option)}</option>
    {/each}
    {#if other.length}
        <option value='otherOptions'>{t.widget.selectPhoto}</option>
    {/if}
{/snippet}

<div class="d-flex gap-1 flex-column">
    {#if widget.compact(data)}
        <label class="input-group">
            <span class="input-group-text">{labelAndStar(widget, data, t)}</span>
            <select class="form-select flex-grow-1" value={widget.value ?? 'notChosen'}
                    onchange={onChange} disabled={widget.lock(data)}>
                {@render showOptions()}
            </select>
        </label>
    {:else}
        <label class="form-floating d-block">
            <select class="form-select" value={widget.value ?? 'notChosen'} onchange={onChange}
                    disabled={widget.lock(data)}>
                {@render showOptions()}
            </select>
            <label for="">{labelAndStar(widget, data, t)}</label>
        </label>
    {/if}

    {#if widget.showError(data)}
        <span class="text-danger">{widget.onError(t, data)}</span>
    {/if}
</div>