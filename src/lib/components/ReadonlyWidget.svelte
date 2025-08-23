<script generics="D" lang="ts">
    import type { Translations } from '$lib/translations';
    import {
        CheckboxWidget,
        CheckboxWithChooserWidget,
        CheckboxWithInputWidget,
        ChooserWidget,
        CountersWidget,
        CounterWidget,
        DoubleChooserWidget,
        FileWidget,
        InputWidget,
        InputWithChooserWidget,
        InputWithSuggestionsWidget,
        MultiCheckboxWidget,
        PhotoSelectorWidget,
        RadioWidget,
        ScannerWidget,
        SearchWidget,
        SwitchWidget,
        TextWidget,
        TitleWidget,
        type Widget,
    } from '$lib/forms/Widget.svelte';
    import { dateFromISO, datetimeFromISO } from '$lib/helpers/date';

    interface Props {
        t: Translations;
        widget: Widget<D>;
        data: D;
    }

    const { t, widget, data }: Props = $props();
</script>

{#if widget instanceof TitleWidget && widget.showTextValue(data)}
    {#await widget.text(t, data) then text}
        {#if text}<h2 class={[widget.class(data), 'm-0']}>{text}</h2>{/if}
    {/await}
{:else if widget instanceof TextWidget && widget.showTextValue(data)}
    {#await widget.text(t, data) then text}
        {#if text}<p class={[widget.class(data), 'm-0']}>{text}</p>{/if}
    {/await}
{:else if widget.showTextValue(data)}
    <p class="mb-0"><b>{widget.label(t, data)}</b>:
        {#if widget instanceof ScannerWidget}
            {widget.value}
        {:else if widget instanceof InputWidget}
            {!widget.value
                ? ''
                : widget.type(data) === 'date'
                    ? dateFromISO(widget.value)
                    : widget.type(data) === 'datetime-local'
                        ? datetimeFromISO(widget.value)
                        : widget.value}
        {:else if widget instanceof DoubleChooserWidget}
            {widget.get(t, widget.value.first)} {widget.get(t, widget.value.second)}
        {:else if widget instanceof ChooserWidget}
            {widget.get(t, widget.value)}
        {:else if widget instanceof RadioWidget}
            {widget.get(t, widget.value)}
        {:else if widget instanceof SwitchWidget}
            {widget.value ? widget.options(t)[1] : widget.options(t)[0]}
        {:else if widget instanceof MultiCheckboxWidget}
            {widget.value.map(v => widget.get(t, v)).join(', ')}
        {:else if widget instanceof CheckboxWidget}
            {widget.value ? t.widget.yes : t.widget.no}
        {:else if widget instanceof CounterWidget}
            {widget.value}
        {:else if widget instanceof CheckboxWithChooserWidget}
            {widget.value.checked ? widget.get(t, widget.value.chosen) : t.widget.no}
        {:else if widget instanceof InputWithSuggestionsWidget}
            {widget.value}
        {:else if widget instanceof CountersWidget}
            {widget.value.mapTo((k, v) => `${widget.get(t, k)}: ${v}x`).join(', ')}
        {:else if widget instanceof InputWithChooserWidget}
            {widget.value.text} {widget.get(t, widget.value.chosen)}
        {:else if widget instanceof CheckboxWithInputWidget}
            {widget.value.checked ? widget.value.text : t.widget.no}
        {:else if widget instanceof SearchWidget}
            {widget.getXmlEntry()}
        {:else if widget instanceof FileWidget} <!-- Not supported -->
        {:else if widget instanceof PhotoSelectorWidget} <!-- Not supported -->
        {/if}
    </p>
{/if}