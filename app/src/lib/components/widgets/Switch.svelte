<script generics="D" lang="ts">
    import type { Translations } from '$lib/translations';
    import { type SwitchWidget } from '$lib/forms/Widget.svelte.js';

    interface Props {
        t: Translations;
        widget: SwitchWidget<D>;
        data: D;
    }

    let { t, widget = $bindable(), data }: Props = $props();
    const value = $derived(widget.bindableValue(data));
</script>

<div class="d-flex gap-1 flex-column align-items-start">
    <div class="input-group d-flex flex-nowrap">
        <span class="input-group-text">{widget.label(t, data)}</span>
        {#each widget.options(t) as option, i}
            <input
                type="radio"
                class="btn-check"
                bind:group={value.value}
                value={Boolean(i)}
                id={widget.label(t, data) + Boolean(i)}
                autocomplete="off"
            />
            <label class={["btn text-nowrap",
                widget.value !== Boolean(i) ? 'btn-outline-secondary'
                    : !widget.hasPositivity(data) ? 'btn-secondary'
                    : i === 1 ? 'btn-success' : 'btn-danger'
            ]} for={widget.label(t, data) + Boolean(i)}
            >{option}</label>
        {/each}
    </div>

    {#if widget.showError(data)}
        <span class="text-danger">{widget.onError(t, data)}</span>
    {/if}
</div>