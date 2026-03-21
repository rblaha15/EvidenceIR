<script generics="C, I extends string" lang="ts">
    import type { Translations } from '$lib/translations';
    import { type MultiCheckboxWidget, labelAndStar, type Arr } from '$lib/forms/Widget.svelte.js';

    interface Props {
        t: Translations;
        widget: MultiCheckboxWidget<C, I>;
        context: C;
        value: Arr<I>;
    }

    let { t, widget, value = $bindable(), context }: Props = $props();

    const weights = $derived((i: I) => widget.weights(context, i));
    const count = $derived(value.sumBy(weights));
    const options = $derived(widget.options(context));
    const chosen = {
        get value() {
            return value;
        },
        set value(chosen) {
            value = chosen;
            widget.onValueSet(context, chosen);
        },
    };

    const checked = (item: I) => value.includes(item).let(c => widget.inverseSelection ? !c : c)
    const onClick = (item: I) => () => {
        chosen.value = value.toggle(item);
    };

    const uid = $props.id();
</script>

<div class="d-flex gap-1 flex-column">
    <div>{labelAndStar(widget, context, t)}</div>
    <div class="input-group input-group-grid">
        {#each options as item}
            <button class="input-group-text input-group-input first" onclick={onClick(item)}
                    disabled={widget.lock(context) || !checked(item) && count + weights(item) > widget.max(context)}
                    aria-labelledby="label-{uid}-{item}" tabindex="-1"
            >
                <input class="form-check-input m-0" type="checkbox" role="button" bind:group={chosen.value}
                       disabled={widget.lock(context) || !checked(item) && count + weights(item) > widget.max(context)} value={item} />
            </button>
            <button onclick={onClick(item)} class="input-group-text last"
                    tabindex="-1" id="label-{uid}-{item}"
                    disabled={widget.lock(context) || !checked(item) && count + weights(item) > widget.max(context)}
            >{widget.get(t, item)}</button>
        {/each}
    </div>

    {#if widget.showError(context, value)}
        <span class="text-danger">{widget.onError(t, context)}</span>
    {/if}
</div>
