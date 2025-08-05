<script generics="D, I extends TranslationReference" lang="ts">
    import type { TranslationReference, Translations } from '$lib/translations';
    import { CheckboxWithChooserWidget, labelAndStar } from '$lib/forms/Widget.svelte.js';
    import type { Action } from 'svelte/action';
    import { onMount } from 'svelte';

    interface Props {
        t: Translations;
        widget: CheckboxWithChooserWidget<D, I>;
        data: D;
    }

    let { t, widget = $bindable(), data }: Props = $props();

    const onChange = (
        e: Event & {
            currentTarget: HTMLSelectElement;
        },
    ) => widget.setValue(
        data, { checked: true, chosen: e.currentTarget.value as I },
    );

    let mounted = false;
    onMount(() => (mounted = true));
    const Select: Action<HTMLSelectElement> = (e) => {
        if (mounted) e.showPicker();
    };

    const onClick = () => {
        widget.mutateValue(data, v => ({ ...v, checked: !v.checked }));
    };

    const uid = $props.id();
</script>

<div class="d-flex gap-1 flex-column">
    <div class="input-group">
        <button aria-labelledby="label-{uid}" class="input-group-text input-group-input" onclick={onClick} tabindex="-1">
            <input bind:checked={widget.value.checked} class="form-check-input m-0" role="button" type="checkbox" />
        </button>
        <label class="form-floating d-block" id="label-{uid}">
            {#if widget.value.checked}
                <select class="form-select" value={widget.value.chosen ?? 'notChosen'} onchange={onChange} use:Select>
                    <option class="d-none" value='notChosen'>{t.widget.notChosen}</option>
                    {#each widget.options(data) as moznost}
                        <option value={moznost}>{t.get(moznost)}</option>
                    {/each}
                </select>
            {:else}
                <input type="text" placeholder={labelAndStar(widget, data, t)} readonly onclick={onClick}
                       class="form-control shadow-none input-group-text" role="button"
                       tabindex="-1" />
            {/if}
            <label for="">{labelAndStar(widget, data, t)}</label>
        </label>
    </div>

    {#if widget.showError(data)}
        <p class="text-danger">{t.get(widget.onError(data, t))}</p>
    {/if}
</div>