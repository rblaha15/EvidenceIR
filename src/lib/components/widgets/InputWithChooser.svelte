<script generics="C, I extends string" lang="ts">
    import type { Translations } from '$lib/translations';
    import { type InputWithChooserWidget, labelAndStar, type SeI } from '$lib/forms/Widget';
    import CoreInput from '$lib/components/CoreInput.svelte';
    import type { ChangeEventHandler } from 'svelte/elements';

    interface Props {
        t: Translations;
        widget: InputWithChooserWidget<C, I>;
        context: C;
        value: SeI<I>;
        showAllErrors: boolean;
    }

    let { t, widget, value = $bindable(), context, showAllErrors }: Props = $props();
    let showError = $derived(showAllErrors);

    const onChange: ChangeEventHandler<HTMLSelectElement> = e => {
        const newValue = { ...value, chosen: e.currentTarget.value as I };
        value = newValue;
        widget.onValueSet(context, newValue);
    };
</script>

{#snippet trailingContent()}
    <select
        class="form-select right"
        id={labelAndStar(widget, context, t)}
        value={value.chosen}
        onchange={onChange}
    >
        {#each widget.options as moznost}
            <option value={moznost}>{widget.get(t, moznost)}</option>
        {/each}
    </select>
{/snippet}

<CoreInput
    bind:value {widget} {context} setTextValue={text => ({ ...value, text })} {t} textValue={value.text} bind:showError labelClass="input-left"
    {trailingContent}
/>

<style>
    /*noinspection CssUnusedSymbol*/
    :global(.input-left) {
        width: 80% !important;
        max-width: 80% !important;
    }

    .right {
        width: 20% !important;
    }
</style>
