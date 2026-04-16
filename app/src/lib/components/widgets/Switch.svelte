<script generics="C" lang="ts">
    import type { Translations } from '$lib/translations';
    import type { SwitchWidget } from '$lib/forms/Widget';


    interface Props {
        t: Translations;
        widget: SwitchWidget<C>;
        context: C;
        value: boolean;
        showAllErrors: boolean;
    }

    let { t, widget, value = $bindable(), context, showAllErrors }: Props = $props();
    let showError = $derived(showAllErrors);
    const checked = {
        get value() {
            return value;
        },
        set value(checked) {
            value = checked;
            widget.onValueSet(context, checked);
            showError = true;
        },
    };
</script>

<div class="flex gap-1 flex-col items-start">
    <div class="input-group flex flex-nowrap">
        <span class="input-group-text">{widget.label(t, context)}</span>
        {#each widget.options(t) as option, i}
            <input
                type="radio"
                class="btn-check"
                bind:group={checked.value}
                value={Boolean(i)}
                id={widget.label(t, context) + Boolean(i)}
                autocomplete="off"
            />
            <label class={["btn text-nowrap flex items-center",
                checked.value !== Boolean(i) ? 'btn-outline-secondary'
                    : !widget.hasPositivity(context) ? 'btn-secondary'
                    : i === 1 ? 'btn-success' : 'btn-danger'
            ]} for={widget.label(t, context) + Boolean(i)}
            >{option}</label>
        {/each}
    </div>

    {#if widget.isError(context, value) && showError}
        <span class="text-danger">{widget.onError(t, context)}</span>
    {/if}
</div>