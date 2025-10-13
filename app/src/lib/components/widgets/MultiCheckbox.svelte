<script generics="D, I extends string" lang="ts">
    import type { Translations } from '$lib/translations';
    import { type MultiCheckboxWidget, labelAndStar } from '$lib/forms/Widget.svelte.js';

    interface Props {
        t: Translations;
        widget: MultiCheckboxWidget<D, I>;
        data: D;
    }

    let { t, widget = $bindable(), data }: Props = $props();

    const weights = $derived(widget.weights);
    const count = $derived(widget.value.sumBy(weights));
    const options = $derived(widget.options(data));
    const value = $derived({
        get value() {
            return widget.inverseSelection ? options.filter(i => !widget.value.includes(i)) : widget.value
        },
        set value(selected) {
            widget.setValue(data, widget.inverseSelection ? options.filter(i => !selected.includes(i)) : selected)
        }
    })

    const checked = (item: I) => widget.value.includes(item).let(c => widget.inverseSelection ? !c : c)
    const onClick = (item: I) => () => {
        widget.mutateValue(data, v => v.toggle(item));
    };

    const uid = $props.id();
</script>

<div class="d-flex gap-1 flex-column">
    <div>{labelAndStar(widget, data, t)}</div>
    <div class="input-group input-group-grid">
        {#each options as item}
            <button class="input-group-text input-group-input first" onclick={onClick(item)}
                    disabled={widget.lock(data) || !checked(item) && count + weights(item) > widget.max(data)}
                    aria-labelledby="label-{uid}-{item}" tabindex="-1"
            >
                <input class="form-check-input m-0" type="checkbox" role="button" bind:group={value.value}
                       disabled={widget.lock(data) || !checked(item) && count + weights(item) > widget.max(data)} value={item} />
            </button>
            <button onclick={onClick(item)} class="input-group-text last"
                    tabindex="-1" id="label-{uid}-{item}"
                    disabled={widget.lock(data) || !checked(item) && count + weights(item) > widget.max(data)}
            >{widget.get(t, item)}</button>
        {/each}
    </div>

    {#if widget.showError(data)}
        <span class="text-danger">{widget.onError(t, data)}</span>
    {/if}
</div>
