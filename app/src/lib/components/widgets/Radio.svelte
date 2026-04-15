<script generics="C, I extends string" lang="ts">
    import type { Translations } from '$lib/translations';
    import Icon from '$lib/components/Icon.svelte';
    import { labelAndStar, type RadioWidget } from '$lib/forms/Widget';

    interface Props {
        t: Translations;
        widget: RadioWidget<C, I>;
        context: C;
        value: I | null;
        showAllErrors: boolean;
    }

    let { t, widget, value = $bindable(), context, showAllErrors }: Props = $props();
    let showError = $derived(showAllErrors);

    const chosen = {
        get value() {
            return value;
        },
        set value(chosen) {
            value = chosen;
            widget.onValueSet(context, chosen);
            showError = true;
        },
    };

    const onClick = (item: I | null) => () => chosen.value = item;

    const uid = $props.id();
</script>

<div class="flex gap-1 flex-column">
    <div class="flex align-items-center">
        {labelAndStar(widget, context, t)}
        {#if !widget.required(context)}
            <button class="btn py-1 px-2 m-1" aria-label={t.widget.clearSelection} onclick={onClick(null)}>
                <Icon icon="clear" />
            </button>
        {/if}
    </div>
    <div class="input-group input-group-grid">
        {#each widget.options(context) as item}
            <button class="input-group-text input-group-input first" onclick={onClick(item)}
                    aria-labelledby="label-{uid}-{item}" tabindex="-1" disabled={widget.lock(context)}
            >
                <input class="form-check-input m-0" type="radio" role="button" disabled={widget.lock(context)}
                       bind:group={chosen.value} value={item} />
            </button>
            <button onclick={onClick(item)} tabindex="-1" disabled={widget.lock(context)}
                    id="label-{uid}-{item}" class="input-group-text last"
            >{widget.get(t, item)}</button>
        {/each}
    </div>

    {#if widget.isError(context, value) && showError}
        <span class="text-danger">{widget.onError(t, context)}</span>
    {/if}
</div>