<script generics="D" lang="ts">
    import type { TranslationReference, Translations } from '$lib/translations';
    import { CheckboxWithChooserWidget, nazevSHvezdou } from '$lib/Widget.svelte.js';
    import type { Action } from 'svelte/action';
    import { onMount } from 'svelte';

    interface Props {
        t: Translations;
        widget: CheckboxWithChooserWidget<D>;
        data: D;
    }

    let { t, widget = $bindable(), data }: Props = $props();

    const onChange = (
        e: Event & {
            currentTarget: HTMLSelectElement;
        }
    ) => widget.setValue(
        data, { checked: true, chosen: e.currentTarget.value as TranslationReference },
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

<div class="mb-3 d-flex align-items-center">
    {#if widget.show(data)}
        <div class="input-group">
            <button class="input-group-text" onclick={onClick} aria-labelledby="label-{uid}" tabindex="-1">
                <input class="form-check-input m-0" type="checkbox" role="button" bind:checked={widget.value.checked} />
            </button>
            <label class="form-floating d-block" id="label-{uid}">
                {#if widget.value.checked}
                    <select class="form-select" value={widget.value.chosen ?? 'notChosen'} onchange={onChange} use:Select>
                        <option class="d-none" value='notChosen'>{t.notChosen}</option>
                        {#each widget.options(data) as moznost}
                            <option value={moznost}>{t.get(moznost)}</option>
                        {/each}
                    </select>
                {:else}
                    <input type="text" placeholder={nazevSHvezdou(widget, data, t)} readonly onclick={onClick}
                           class="form-control shadow-none" role="button"
                           tabindex="-1" style="border-color: var(--bs-border-color)" />
                {/if}
                <label for="">{nazevSHvezdou(widget, data, t)}</label>
            </label>
        </div>

        {#if widget.showError(data)}
            <p class="text-danger">{t.get(widget.onError(data, t))}</p>
        {/if}
    {/if}
</div>