<script generics="C" lang="ts">
    import type { Translations } from '$lib/translations';
    import {
        ButtonWidget,
        CheckboxWidget,
        CheckboxWithChooserWidget,
        CheckboxWithInputWidget,
        ChooserWidget,
        CountersWidget,
        CounterWidget,
        DoubleChooserWidget,
        FileWidget, InlinePdfPreviewWidget,
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
    import Title from '$lib/components/widgets/Title.svelte';
    import { RadioWithInputWidget } from '$lib/forms/Widget.svelte.js';
    import type { WidgetValue } from '$lib/forms/Form';

    interface Props {
        t: Translations;
        widget: Widget<C>;
        context: C;
        value: WidgetValue<Widget<C>>;
    }

    const { t, widget, value, context }: Props = $props();

    const v = <U>(_w: Widget<C, U>, _v: unknown): _v is U => true;
</script>

{#if widget instanceof TitleWidget && widget.showTextValue(context)}
    <Title {widget} {context} {t} />
{:else if widget instanceof TextWidget && widget.showTextValue(context)}
    {#await widget.text(t, context) then text}
        {#if text}<p class={[widget.class(context), 'm-0']}>{text}</p>{/if}
    {/await}
{:else if widget instanceof InlinePdfPreviewWidget} <!-- Not supported -->
{:else if widget instanceof ButtonWidget} <!-- Not supported -->
{:else if widget.showTextValue(context)}
    <p class="mb-0"><b>{widget.label(t, context)}</b>:
        {#if widget instanceof ScannerWidget && v(widget, value)}
            {value}
        {:else if widget instanceof InputWidget && v(widget, value)}
            {!value
                ? ''
                : widget.type(context) === 'date'
                    ? dateFromISO(value)
                    : widget.type(context) === 'datetime-local'
                        ? datetimeFromISO(value)
                        : value}
        {:else if widget instanceof DoubleChooserWidget && v(widget, value)}
            {widget.get(t, value.first)} {widget.get(t, value.second)}
        {:else if widget instanceof ChooserWidget && v(widget, value)}
            {widget.get(t, value)}
        {:else if widget instanceof RadioWidget && v(widget, value)}
            {widget.get(t, value)}
        {:else if widget instanceof RadioWithInputWidget && v(widget, value)}
            {value.chosen === widget.options(context).at(-1) ? value.text : widget.get(t, value.chosen)}
        {:else if widget instanceof SwitchWidget && v(widget, value)}
            {value ? widget.options(t)[1] : widget.options(t)[0]}
        {:else if widget instanceof MultiCheckboxWidget && v(widget, value)}
            {(widget.inverseSelection ? widget.options(context).filter(i => !value.includes(i)) : value)
                .map(v => widget.get(t, v)).join(', ')}
        {:else if widget instanceof CheckboxWidget && v(widget, value)}
            {value ? t.widget.yes : t.widget.no}
        {:else if widget instanceof CounterWidget && v(widget, value)}
            {value}
        {:else if widget instanceof CheckboxWithChooserWidget && v(widget, value)}
            {value.checked ? widget.get(t, value.chosen) : t.widget.no}
        {:else if widget instanceof InputWithSuggestionsWidget && v(widget, value)}
            {value}
        {:else if widget instanceof CountersWidget && v(widget, value)}
            {value.mapTo((k, v) => `${widget.get(t, k)}: ${v}x`).join(', ')}
        {:else if widget instanceof InputWithChooserWidget && v(widget, value)}
            {value.text} {widget.get(t, value.chosen)}
        {:else if widget instanceof CheckboxWithInputWidget && v(widget, value)}
            {value.checked ? value.text : t.widget.no}
        {:else if widget instanceof SearchWidget && v(widget, value)}
            {widget.getXmlEntry()}
        {:else if widget instanceof FileWidget && v(widget, value)} <!-- Not supported -->
        {:else if widget instanceof PhotoSelectorWidget && v(widget, value)} <!-- Not supported -->
        {/if}
    </p>
{/if}