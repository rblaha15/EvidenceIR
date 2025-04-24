<script generics="D" lang="ts">
    import type { TranslationReference, Translations } from '$lib/translations';
    import { type MultiCheckboxWidget, nazevSHvezdou } from '$lib/Widget.svelte.js';

    interface Props {
        t: Translations;
        widget: MultiCheckboxWidget<D>;
        data: D;
    }

    let { t, widget = $bindable(), data }: Props = $props();

    const pocet = $derived(widget.value.length);
    const value = $derived(widget.bindableValue(data));

    const onClick = (item: TranslationReference) => () => {
        widget.mutateValue(data, v => v.toggle(item));
    };

    const uid = $props.id();
</script>

{#if widget.show(data)}
    <label class="d-block" for="">{nazevSHvezdou(widget, data, t)}</label>
    <div class="input-group input-group-grid">
        {#each widget.options(data) as item}
            <button class="input-group-text input-group-input first" onclick={onClick(item)}
                    disabled={!widget.value.includes(item) && pocet >= widget.max(data)}
                    aria-labelledby="label-{uid}-{item}" tabindex="-1"
            >
                <input class="form-check-input m-0" type="checkbox" role="button" bind:group={value.value}
                       disabled={!widget.value.includes(item) && pocet >= widget.max(data)} value={item} />
            </button>
            <button onclick={onClick(item)} class="input-group-text last"
                    tabindex="-1" id="label-{uid}-{item}"
            >{t.get(item)}</button>
        {/each}
    </div>

    {#if widget.showError(data)}
        <p class="text-danger">{t.get(widget.onError(data, t))}</p>
    {/if}

    <div class="mb-3"></div>
{/if}
