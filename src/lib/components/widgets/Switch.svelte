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

<div class="d-flex gap-1 flex-column">
    <div class="input-group flex-nowrap" style="width: min-content">
        <span class="input-group-text" style="width: max-content">{t.get(widget.label(data, t))}</span>
        {#each widget.options as option, i}
            <input
                type="radio"
                class="btn-check"
                bind:group={value.value}
                value={Boolean(i)}
                id={widget.label(data, t) + Boolean(i)}
                autocomplete="off"
            />
            <label class={["btn",
                widget.value !== Boolean(i) ? 'btn-outline-secondary'
                    : !widget.hasPositivity(data) ? 'btn-secondary'
                    : i === 1 ? 'btn-success' : 'btn-danger'
            ]} for={widget.label(data, t) + Boolean(i)}
            >{t.get(option)}</label>
        {/each}
    </div>

    {#if widget.showError(data)}
        <span class="text-danger">{t.get(widget.onError(data, t))}</span>
    {/if}
</div>