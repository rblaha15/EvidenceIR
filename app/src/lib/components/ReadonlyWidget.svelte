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
    {#await widget.text(data, t) then text}
        {#if text}<h2 class={[widget.class(data, t), 'm-0']}>{t.get(text)}</h2>{/if}
    {/await}
{:else if widget instanceof TextWidget && widget.showTextValue(data)}
    {#await widget.text(data, t) then text}
        {#if text}<p class={[widget.class(data, t), 'm-0']}>{t.get(text)}</p>{/if}
    {/await}
{:else if widget.showTextValue(data)}
    <p class="mb-0"><b>{t.get(widget.label(data, t))}</b>:
        {#if widget instanceof ScannerWidget}
            {widget.value}
        {:else if widget instanceof InputWidget}
            {!widget.value
                ? ''
                : widget.type(data, t) === 'date'
                    ? dateFromISO(widget.value)
                    : widget.type(data, t) === 'datetime-local'
                        ? datetimeFromISO(widget.value)
                        : widget.value}
        {:else if widget instanceof DoubleChooserWidget}
            {t.get(widget.value.first) ?? ''} {t.get(widget.value.second) ?? ''}
        {:else if widget instanceof ChooserWidget}
            {t.get(widget.value) ?? ''}
        {:else if widget instanceof RadioWidget}
            {t.get(widget.value) ?? ''}
        {:else if widget instanceof SwitchWidget}
            {t.get(widget.value ? widget.options[1] : widget.options[0])}
        {:else if widget instanceof MultiCheckboxWidget}
            {widget.value.map(s => t.get(s)).join(', ')}
        {:else if widget instanceof CheckboxWidget}
            {widget.value ? t.yes : t.no}
        {:else if widget instanceof CounterWidget}
            {widget.value}
        {:else if widget instanceof CheckboxWithChooserWidget}
            {widget.value.checked ? t.get(widget.value.chosen) ?? '' : t.no}
        {:else if widget instanceof InputWithSuggestionsWidget}
            {widget.value}
        {:else if widget instanceof CountersWidget}
            {widget.options(data).zip(widget.value).map(([k, v]) => `${t.get(k)}: ${v}x`).join(', ')}
        {:else if widget instanceof InputWithChooserWidget}
            {widget.value.text} {t.get(widget.value.chosen) ?? ''}
        {:else if widget instanceof CheckboxWithInputWidget}
            {widget.value.checked ? widget.value.text : t.no}
        {:else if widget instanceof SearchWidget}
            {widget.getXmlEntry()}
        {:else if widget instanceof FileWidget} <!-- Not supported -->
        {:else if widget instanceof PhotoSelectorWidget} <!-- Not supported -->
        {/if}
    </p>
{/if}