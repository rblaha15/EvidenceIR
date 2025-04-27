<script generics="D" lang="ts">
    import type { Translations } from '$lib/translations';
    import { labelAndStar, type SwitchWidget } from '$lib/Widget.svelte.js';

    interface Props {
        t: Translations;
        widget: SwitchWidget<D>;
        data: D;
    }

    let { t, widget = $bindable(), data }: Props = $props();
    const value = $derived(widget.bindableValue(data));
</script>

{#if widget.show(data)}
    <div class="d-flex align-items-center mb-3">
        <div class="me-2">{labelAndStar(widget, data, t)}</div>
        <div class="btn-group" role="group">
            {#each widget.options as moznost, i}
                <input
                    type="radio"
                    class="btn-check"
                    bind:group={value.value}
                    value={Boolean(i)}
                    id={widget.label(data, t) + Boolean(i)}
                    autocomplete="off"
                />
                <label class="btn btn-sm {
					widget.value !== Boolean(i) ? 'btn-outline-secondary'
						: !widget.hasPositivity(data) ? 'btn-secondary'
						 	: i === 1 ? 'btn-success' : 'btn-danger'
				}" for={widget.label(data, t) + Boolean(i)}
                >{t.get(moznost)}</label>
            {/each}
        </div>
    </div>

    {#if widget.showError(data)}
        <p class="text-danger">{t.get(widget.onError(data, t))}</p>
    {/if}
{/if}
