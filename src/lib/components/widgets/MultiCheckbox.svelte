<script generics="D, I extends TranslationReference" lang="ts">
    import type { TranslationReference, Translations } from '$lib/translations';
    import { type MultiCheckboxWidget, labelAndStar } from '$lib/forms/Widget.svelte.js';

    interface Props {
        t: Translations;
        widget: MultiCheckboxWidget<D, I>;
        data: D;
    }

    let { t, widget = $bindable(), data }: Props = $props();

    const pocet = $derived(widget.value.length);
    const value = $derived(widget.bindableValue(data));

    const onClick = (item: I) => () => {
        widget.mutateValue(data, v => v.toggle(item));
    };

    const uid = $props.id();
</script>

<div class="d-flex gap-1 flex-column">
    <div>{labelAndStar(widget, data, t)}</div>
    <div class="input-group input-group-grid">
        {#each widget.options(data) as item}
            <button class="input-group-text input-group-input first" onclick={onClick(item)}
                    disabled={widget.lock(data) || !widget.value.includes(item) && pocet >= widget.max(data)}
                    aria-labelledby="label-{uid}-{item}" tabindex="-1"
            >
                <input class="form-check-input m-0" type="checkbox" role="button" bind:group={value.value}
                       disabled={widget.lock(data) || !widget.value.includes(item) && pocet >= widget.max(data)} value={item} />
            </button>
            <button onclick={onClick(item)} class="input-group-text last"
                    tabindex="-1" id="label-{uid}-{item}"
                    disabled={widget.lock(data) || !widget.value.includes(item) && pocet >= widget.max(data)}
            >{t.get(item)}</button>
        {/each}
    </div>

    {#if widget.showError(data)}
        <span class="text-danger">{t.get(widget.onError(data, t))}</span>
    {/if}
</div>
